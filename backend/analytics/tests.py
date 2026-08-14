from datetime import date
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from music.models import Album, Song
from payments.models import Payment
from tracking.models import SongPlay
from .models import ArtistSettlement


class AnalyticsTests(APITestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='StrongPass123!',
            name='Admin User',
            role='admin',
        )
        self.artist_user = User.objects.create_user(
            email='artist@example.com',
            password='StrongPass123!',
            name='Artist User',
            role='artist',
            stage_name='Artist Stage',
        )
        self.listener_user = User.objects.create_user(
            email='listener@example.com',
            password='StrongPass123!',
            name='Listener User',
            role='listener',
            tier='free',
        )

        self.album = Album.objects.create(
            title='Test Album',
            artist=self.artist_user,
        )
        self.song = Song.objects.create(
            title='Test Song',
            artist=self.artist_user,
            album=self.album,
            duration=180,
        )

        self.settlement = ArtistSettlement.objects.create(
            artist=self.artist_user,
            period=date(2026, 8, 1),
            total_streams=150,
            unique_listeners=45,
            amount_due=12.50,
            status=ArtistSettlement.Status.PENDING,
        )

        self.admin_stats_url = reverse('analytics:admin-stats')
        self.artist_stats_url = reverse('analytics:artist-stats')
        self.settlement_list_url = reverse('analytics:settlement-list')
        self.settlement_settle_url = reverse('analytics:settlement-detail', kwargs={'pk': self.settlement.pk}) + 'settle/'

    def test_admin_stats_calculation(self):
        # Create a completed payment for this month
        Payment.objects.create(
            user=self.listener_user,
            amount=9.99,
            type=Payment.Type.SUBSCRIPTION_PURCHASE,
            status=Payment.Status.COMPLETED,
        )

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.admin_stats_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(response.data['current_month_earnings']), 9.99)
        self.assertGreaterEqual(len(response.data['tier_distribution']), 1)

    def test_artist_stats_calculation(self):
        # Record some plays for the artist's song
        SongPlay.objects.create(user=self.listener_user, song=self.song)
        SongPlay.objects.create(user=self.listener_user, song=self.song)

        self.client.force_authenticate(user=self.artist_user)
        response = self.client.get(self.artist_stats_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_streams'], 2)
        self.assertEqual(response.data['unique_listeners'], 1)

    def test_artist_settlement_list_permissions(self):
        # Artist should only see their own settlements
        self.client.force_authenticate(user=self.artist_user)
        response = self.client.get(self.settlement_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.settlement.id)

    def test_admin_can_mark_settlement_as_settled(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(self.settlement_settle_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'settled')

        self.settlement.refresh_from_db()
        self.assertEqual(self.settlement.status, 'settled')
        self.assertIsNotNone(self.settlement.settled_at)