from django.db.models import Prefetch, Q
from rest_framework import permissions, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser

from .models import Album, Song
from .serializers import AlbumSerializer, SongSerializer
from accounts.models import Follow
from notifications.models import Notification


class IsArtistOrReadOnly(permissions.BasePermission):
    """
    Allows read access to anyone.
    Allows write access (POST, PUT, PATCH, DELETE) only to authenticated artists or admins.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(
            request.user 
            and request.user.is_authenticated 
            and request.user.role in ['artist', 'admin', 'support']
        )

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Only the artist who owns the song or an admin can modify/delete it
        return obj.artist == request.user or request.user.role == 'admin' or request.user.is_staff


class SongViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for songs.
    """
    serializer_class = SongSerializer
    permission_classes = [IsArtistOrReadOnly]
    # Required for handling file uploads (audio and cover art) via FormData
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        qs = Song.objects.select_related('artist', 'album').order_by('-created_at')

        if user and user.is_authenticated:
            if user.role == 'artist':
                # Artists see their own unapproved songs + all approved songs
                return qs.filter(Q(artist=user) | Q(approved=True))
            elif user.role in ['admin', 'support'] or user.is_staff:
                # Admins/Support see everything
                return qs
                
        # Public users and listeners only see approved songs
        return qs.filter(approved=True)
    
    def perform_create(self, serializer):
        song = serializer.save()

        followers = Follow.objects.filter(artist=song.artist).select_related('follower')
        for follow in followers:
            Notification.objects.create(
                user=follow.follower,
                type=Notification.Type.MUSIC,
                title=f'New Release: "{song.title}"',
                message=f'{song.artist.display_name} just released a new track. Stream it now!',
                link='/search',
            )


class AlbumViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public read-only endpoint for albums.
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