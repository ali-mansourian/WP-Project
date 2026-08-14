from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from .models import Album, Song


class MusicCatalogTests(APITestCase):
    def setUp(self):
        self.artist = User.objects.create_user(
            email='artist@example.com',
            password='StrongPass123!',
            name='Test Artist',
            role='artist',
        )

        self.album = Album.objects.create(
            title='Test Album',
            artist=self.artist,
        )

        self.approved_song = Song.objects.create(
            title='Approved Song',
            artist=self.artist,
            album=self.album,
            duration=180,
            approved=True,
        )

        self.unapproved_song = Song.objects.create(
            title='Hidden Song',
            artist=self.artist,
            album=self.album,
            duration=200,
            approved=False,
        )

        self.song_list_url = reverse('music:song-list')
        self.album_list_url = reverse('music:album-list')

    def test_song_list_returns_only_approved_songs(self):
        response = self.client.get(self.song_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        titles = [song['title'] for song in response.data]
        self.assertIn('Approved Song', titles)
        self.assertNotIn('Hidden Song', titles)

    def test_song_detail_returns_approved_song(self):
        url = reverse('music:song-detail', args=[self.approved_song.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Approved Song')
        self.assertEqual(response.data['artist_name'], 'Test Artist')

    def test_album_list_returns_albums(self):
        response = self.client.get(self.album_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        titles = [album['title'] for album in response.data]
        self.assertIn('Test Album', titles)

    def test_album_detail_includes_only_approved_songs(self):
        url = reverse('music:album-detail', args=[self.album.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Album')

        song_titles = [song['title'] for song in response.data['songs']]
        self.assertIn('Approved Song', song_titles)
        self.assertNotIn('Hidden Song', song_titles)