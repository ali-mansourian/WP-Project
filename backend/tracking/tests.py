from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from music.models import Song
from subscriptions.models import SubscriptionPlan, UserSubscription
from .models import SongPlay


class TrackingTests(APITestCase):
    def setUp(self):
        self.play_url = reverse('tracking:songplay-list')

        self.free_listener = User.objects.create_user(
            email='free@example.com',
            password='StrongPass123!',
            name='Free Listener',
            role='listener',
            tier='free',
        )

        self.artist = User.objects.create_user(
            email='artist@example.com',
            password='StrongPass123!',
            name='Artist',
            role='artist',
        )

        self.song = Song.objects.create(
            title='Test Song',
            artist=self.artist,
            duration=180,
            approved=True,
        )

    def authenticate(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def test_unauthenticated_cannot_track(self):
        self.client.credentials()
        response = self.client.post(self.play_url, {'song': self.song.id})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_free_listener_can_track_song(self):
        self.authenticate(self.free_listener)
        
        payload = {
            'song': self.song.id,
            'listened_seconds': 180,
            'completed': True
        }
        
        response = self.client.post(self.play_url, payload, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SongPlay.objects.count(), 1)

    def test_free_listener_hits_limit(self):
        self.authenticate(self.free_listener)
        
        # Create 60 plays manually to bypass API overhead
        for _ in range(60):
            SongPlay.objects.create(user=self.free_listener, song=self.song)

        # 61st play should be rejected
        response = self.client.post(self.play_url, {'song': self.song.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_silver_listener_hits_limit(self):
        silver_listener = User.objects.create_user(
            email='silver@example.com',
            password='pw',
            name='Silver Listener',
            role='listener',
            tier='silver'
        )
        plan = SubscriptionPlan.objects.create(
            tier='silver', duration_months=1, price=Decimal('4.99'), is_active=True
        )
        UserSubscription.objects.create(
            user=silver_listener, plan=plan, status=UserSubscription.Status.ACTIVE
        )

        self.authenticate(silver_listener)
        
        for _ in range(100):
            SongPlay.objects.create(user=silver_listener, song=self.song)

        response = self.client.post(self.play_url, {'song': self.song.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_gold_listener_unlimited(self):
        gold_listener = User.objects.create_user(
            email='gold@example.com',
            password='pw',
            name='Gold Listener',
            role='listener',
            tier='gold'
        )
        plan = SubscriptionPlan.objects.create(
            tier='gold', duration_months=1, price=Decimal('9.99'), is_active=True
        )
        UserSubscription.objects.create(
            user=gold_listener, plan=plan, status=UserSubscription.Status.ACTIVE
        )

        self.authenticate(gold_listener)
        
        for _ in range(101):
            SongPlay.objects.create(user=gold_listener, song=self.song)

        response = self.client.post(self.play_url, {'song': self.song.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_artist_unlimited(self):
        self.authenticate(self.artist)
        
        for _ in range(61):
            SongPlay.objects.create(user=self.artist, song=self.song)

        response = self.client.post(self.play_url, {'song': self.song.id}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_can_list_own_history_only(self):
        self.authenticate(self.free_listener)
        
        SongPlay.objects.create(user=self.free_listener, song=self.song)
        SongPlay.objects.create(user=self.artist, song=self.song)

        response = self.client.get(self.play_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['user'], self.free_listener.id)