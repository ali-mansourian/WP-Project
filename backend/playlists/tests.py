from datetime import timedelta
from decimal import Decimal

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from subscriptions.models import SubscriptionPlan, UserSubscription
from .models import Playlist
from music.models import Song


class PlaylistTests(APITestCase):
    def setUp(self):
        self.playlist_list_url = reverse('playlists:playlist-list')

        self.listener = User.objects.create_user(
            email='listener@example.com',
            password='StrongPass123!',
            name='Listener',
            role='listener',
            tier='free',
        )

        token, _ = Token.objects.get_or_create(user=self.listener)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def detail_url(self, playlist_id):
        return reverse('playlists:playlist-detail', args=[playlist_id])

    def authenticate(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def create_active_subscription(self, user, tier, playlist_limit, duration_months=1):
        plan = SubscriptionPlan.objects.create(
            tier=tier,
            duration_months=duration_months,
            price=Decimal('9.99'),
            playlist_limit=playlist_limit,
            is_active=True,
        )

        return UserSubscription.objects.create(
            user=user,
            plan=plan,
            status=UserSubscription.Status.ACTIVE,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=30),
            price_paid=plan.price,
        )

    def test_unauthenticated_user_cannot_list_playlists(self):
        self.client.credentials()

        response = self.client.get(self.playlist_list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_user_can_create_playlist(self):
        payload = {
            'title': 'My Playlist',
            'description': 'Test playlist',
            'visibility': 'private',
        }

        response = self.client.post(self.playlist_list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], payload['title'])
        self.assertEqual(response.data['owner'], self.listener.id)
        self.assertTrue(
            Playlist.objects.filter(
                owner=self.listener,
                title='My Playlist',
            ).exists()
        )

    def test_listener_can_list_only_own_playlists(self):
        Playlist.objects.create(owner=self.listener, title='My First Playlist')

        other_user = User.objects.create_user(
            email='other@example.com',
            password='StrongPass123!',
            name='Other User',
            role='listener',
            tier='free',
        )
        Playlist.objects.create(owner=other_user, title='Other Playlist')

        response = self.client.get(self.playlist_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        titles = [playlist['title'] for playlist in response.data]
        self.assertIn('My First Playlist', titles)
        self.assertNotIn('Other Playlist', titles)

    def test_free_listener_playlist_limit(self):
        for i in range(2):
            payload = {'title': f'Playlist {i}'}
            response = self.client.post(self.playlist_list_url, payload, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        payload = {'title': 'Third Playlist'}
        response = self.client.post(self.playlist_list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_listener_with_active_gold_subscription_gets_higher_limit(self):
        gold_listener = User.objects.create_user(
            email='gold@example.com',
            password='StrongPass123!',
            name='Gold Listener',
            role='listener',
            tier='gold',
        )

        self.create_active_subscription(
            user=gold_listener,
            tier='gold',
            playlist_limit=10,
        )

        self.authenticate(gold_listener)

        for i in range(3):
            payload = {'title': f'Gold Playlist {i}'}
            response = self.client.post(self.playlist_list_url, payload, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_listener_with_custom_subscription_limit(self):
        limited_listener = User.objects.create_user(
            email='limited@example.com',
            password='StrongPass123!',
            name='Limited Listener',
            role='listener',
            tier='silver',
        )

        self.create_active_subscription(
            user=limited_listener,
            tier='silver',
            playlist_limit=1,
        )

        self.authenticate(limited_listener)

        first_response = self.client.post(
            self.playlist_list_url,
            {'title': 'First Playlist'},
            format='json',
        )
        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)

        second_response = self.client.post(
            self.playlist_list_url,
            {'title': 'Second Playlist'},
            format='json',
        )
        self.assertEqual(second_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_expired_subscription_uses_free_limit(self):
        expired_listener = User.objects.create_user(
            email='expired@example.com',
            password='StrongPass123!',
            name='Expired Listener',
            role='listener',
            tier='gold',
        )

        plan = SubscriptionPlan.objects.create(
            tier='gold',
            duration_months=3,
            price=Decimal('9.99'),
            playlist_limit=10,
            is_active=True,
        )

        UserSubscription.objects.create(
            user=expired_listener,
            plan=plan,
            status=UserSubscription.Status.EXPIRED,
            start_date=timezone.now() - timedelta(days=100),
            end_date=timezone.now() - timedelta(days=10),
            price_paid=plan.price,
        )

        self.authenticate(expired_listener)

        for i in range(2):
            payload = {'title': f'Playlist {i}'}
            response = self.client.post(self.playlist_list_url, payload, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        payload = {'title': 'Third Playlist'}
        response = self.client.post(self.playlist_list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_artist_has_no_playlist_limit(self):
        artist = User.objects.create_user(
            email='artist@example.com',
            password='StrongPass123!',
            name='Artist',
            role='artist',
        )

        self.authenticate(artist)

        for i in range(3):
            payload = {'title': f'Artist Playlist {i}'}
            response = self.client.post(self.playlist_list_url, payload, format='json')
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_owner_can_update_playlist(self):
        playlist = Playlist.objects.create(owner=self.listener, title='Old Title')

        response = self.client.patch(
            self.detail_url(playlist.id),
            {'title': 'New Title'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        playlist.refresh_from_db()
        self.assertEqual(playlist.title, 'New Title')

    def test_owner_can_delete_playlist(self):
        playlist = Playlist.objects.create(owner=self.listener, title='Delete Me')

        response = self.client.delete(self.detail_url(playlist.id))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Playlist.objects.filter(id=playlist.id).exists())

    def test_user_cannot_view_another_users_private_playlist(self):
        other_user = User.objects.create_user(
            email='other2@example.com',
            password='StrongPass123!',
            name='Other User 2',
            role='listener',
            tier='free',
        )
        playlist = Playlist.objects.create(owner=other_user, title='Private Other Playlist')

        response = self.client.get(self.detail_url(playlist.id))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_cannot_update_another_users_playlist(self):
        other_user = User.objects.create_user(
            email='other3@example.com',
            password='StrongPass123!',
            name='Other User 3',
            role='listener',
            tier='free',
        )
        playlist = Playlist.objects.create(owner=other_user, title='Other Playlist')

        response = self.client.patch(
            self.detail_url(playlist.id),
            {'title': 'Hacked Title'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
class PlaylistTrackTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email='owner@example.com',
            password='StrongPass123!',
            name='Owner',
            role='listener',
            tier='free',
        )

        self.other_user = User.objects.create_user(
            email='other-track-user@example.com',
            password='StrongPass123!',
            name='Other Track User',
            role='listener',
            tier='free',
        )

        self.artist = User.objects.create_user(
            email='track-artist@example.com',
            password='StrongPass123!',
            name='Track Artist',
            role='artist',
        )

        self.playlist = Playlist.objects.create(
            owner=self.owner,
            title='Track Playlist',
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

        self.add_track_url = reverse(
            'playlists:playlist-add-track',
            args=[self.playlist.id],
        )

        self.authenticate(self.owner)

    def authenticate(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def remove_track_url(self, song_id):
        return reverse(
            'playlists:playlist-remove-track',
            args=[self.playlist.id, song_id],
        )

    def test_unauthenticated_user_cannot_add_track(self):
        self.client.credentials()

        response = self.client.post(
            self.add_track_url,
            {'song_id': self.approved_song.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_owner_can_add_track(self):
        response = self.client.post(
            self.add_track_url,
            {'song_id': self.approved_song.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['song']['title'], 'Approved Song')
        self.assertEqual(self.playlist.tracks.count(), 1)

    def test_add_track_requires_song_id(self):
        response = self.client.post(self.add_track_url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_add_unapproved_song(self):
        response = self.client.post(
            self.add_track_url,
            {'song_id': self.unapproved_song.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_add_duplicate_track(self):
        first_response = self.client.post(
            self.add_track_url,
            {'song_id': self.approved_song.id},
            format='json',
        )
        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)

        second_response = self.client.post(
            self.add_track_url,
            {'song_id': self.approved_song.id},
            format='json',
        )

        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_owner_can_remove_track(self):
        self.client.post(
            self.add_track_url,
            {'song_id': self.approved_song.id},
            format='json',
        )

        response = self.client.delete(self.remove_track_url(self.approved_song.id))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(self.playlist.tracks.count(), 0)

    def test_remove_missing_track_returns_404(self):
        response = self.client.delete(self.remove_track_url(99999))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_non_owner_cannot_add_track(self):
        self.authenticate(self.other_user)

        response = self.client.post(
            self.add_track_url,
            {'song_id': self.approved_song.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)