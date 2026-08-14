from django.db.models import Prefetch
from rest_framework import permissions, viewsets

from .models import Album, Song
from .serializers import AlbumSerializer, SongSerializer


class SongViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoint for approved songs.

    Endpoints:
    - GET /api/music/songs/
    - GET /api/music/songs/{id}/
    """
    serializer_class = SongSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Song.objects.filter(approved=True).select_related(
            'artist',
            'album',
        ).order_by('-created_at')


class AlbumViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoint for albums.

    Albums only include approved songs in this public view.

    Endpoints:
    - GET /api/music/albums/
    - GET /api/music/albums/{id}/
    """
    serializer_class = AlbumSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        approved_songs = Prefetch(
            'songs',
            queryset=Song.objects.filter(approved=True),
        )

        return Album.objects.select_related(
            'artist',
        ).prefetch_related(
            approved_songs,
        ).order_by('-created_at')