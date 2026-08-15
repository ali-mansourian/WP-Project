from unittest import mock

from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from music.models import Song
from .models import SongPlay


class TrackingTests(APITestCase):
    def setUp(self):
        self.artist = User.objects.create_user(
            email='artist@example.com',
            password='StrongPass123!',
            name='Artist',
            role='artist',
        )

        self.listener = User.objects.create_user(
            email='listener@example.com',
            password='StrongPass123!',
            name='Listener',
            role='listener',
            tier='free',
        )

        self.other_listener = User.objects.create_user(
            email='other@example.com',
            password='StrongPass123!',
            name='Other Listener',
            role='listener',
            tier='free',
        )

        self.approved_song = Song.objects.create(
            title='Approved Song',
            artist=self.artist,
            duration=180,
            approved=True,
        )

        self.unapproved_song = Song.objects.create(
            title='Unapproved Song',
            artist=self.artist,
            duration=200,
            approved=False,
        )

        self.play_list_url = reverse('tracking:songplay-list')
        self.daily_status_url = reverse('tracking:songplay-daily-status')

        self.authenticate(self.listener)

    def authenticate(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def play_payload(self, song=None):
        return {
            'song': (song or self.approved_song).id,
            'listened_seconds': 15,
            'song_duration_seconds': 180,
            'completed': False,
        }

    def test_unauthenticated_user_cannot_create_play(self):
        self.client.credentials()

        response = self.client.post(
            self.play_list_url,
            self.play_payload(),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_listener_can_create_play_and_increment_streams(self):
        self.assertEqual(self.approved_song.streams, 0)

        response = self.client.post(
            self.play_list_url,
            self.play_payload(),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.approved_song.refresh_from_db()
        self.assertEqual(self.approved_song.streams, 1)

        self.assertEqual(response.data['user'], self.listener.id)
        self.assertEqual(response.data['song_details']['streams'], 1)

    def test_cannot_create_play_for_unapproved_song(self):
        response = self.client.post(
            self.play_list_url,
            self.play_payload(self.unapproved_song),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_play_requires_at_least_ten_seconds_unless_completed(self):
        payload = self.play_payload()
        payload['listened_seconds'] = 5

        response = self.client.post(
            self.play_list_url,
            payload,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        payload['listened_seconds'] = 0
        payload['completed'] = True

        response = self.client.post(
            self.play_list_url,
            payload,
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_can_list_own_plays_only(self):
        SongPlay.objects.create(
            user=self.listener,
            song=self.approved_song,
            listened_seconds=15,
        )

        SongPlay.objects.create(
            user=self.other_listener,
            song=self.approved_song,
            listened_seconds=15,
        )

        response = self.client.get(self.play_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['user'], self.listener.id)

    def test_daily_status_returns_usage(self):
        SongPlay.objects.create(
            user=self.listener,
            song=self.approved_song,
            listened_seconds=15,
        )

        SongPlay.objects.create(
            user=self.listener,
            song=self.approved_song,
            listened_seconds=20,
        )

        response = self.client.get(self.daily_status_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['used_today'], 2)
        self.assertEqual(response.data['daily_limit'], 60)
        self.assertEqual(response.data['remaining'], 58)
        self.assertFalse(response.data['unlimited'])

    @mock.patch(
        'tracking.views.STREAM_LIMITS',
        {'free': 2, 'silver': 100, 'gold': None},
    )
    def test_free_listener_daily_limit_enforced(self):
        SongPlay.objects.create(
            user=self.listener,
            song=self.approved_song,
            listened_seconds=15,
        )

        SongPlay.objects.create(
            user=self.listener,
            song=self.approved_song,
            listened_seconds=15,
        )

        response = self.client.post(
            self.play_list_url,
            self.play_payload(),
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.get(self.daily_status_url)
        self.assertEqual(response.data['remaining'], 0)

    def test_artist_has_unlimited_stream_status(self):
        self.authenticate(self.artist)

        response = self.client.get(self.daily_status_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['unlimited'])
        self.assertIsNone(response.data['daily_limit'])