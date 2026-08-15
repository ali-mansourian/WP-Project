from django.db.models import Max
from django.shortcuts import get_object_or_404
from rest_framework import exceptions, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from music.models import Song
from subscriptions.models import UserSubscription

from .models import Playlist, PlaylistTrack
from .serializers import (
    PlaylistDetailSerializer,
    PlaylistListSerializer,
    PlaylistTrackSerializer,
)

DEFAULT_FREE_PLAYLIST_LIMIT = 6

def get_playlist_limit_for_user(user):
    """
    Returns the playlist limit for a listener based on their active subscription or tier.
    
    Rules from Project Document:
    - Free: 6 playlists
    - Silver: 100 playlists
    - Gold: Unlimited (None)
    - Non-listeners: Unlimited (None)
    """
    if user.role != 'listener':
        return None

    # 1. Check for an active subscription record first
    subscription = UserSubscription.objects.filter(
        user=user,
        status=UserSubscription.Status.ACTIVE,
    ).select_related(
        'plan',
    ).order_by('-created_at').first()

    if subscription and subscription.is_currently_active:
        if subscription.plan.tier == 'gold':
            return None  # Unlimited
        return subscription.plan.playlist_limit

    # 2. Fallback to the user's current tier if no active subscription exists
    if user.tier == 'gold':
        return None  # Unlimited
    if user.tier == 'silver':
        return 100
        
    return DEFAULT_FREE_PLAYLIST_LIMIT


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Allows full access to the playlist owner.
    Read access is allowed for public playlists.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return (
                obj.owner == request.user
                or obj.visibility == Playlist.Visibility.PUBLIC
            )

        return obj.owner == request.user


class PlaylistViewSet(viewsets.ModelViewSet):
    """
    Playlist CRUD endpoints for the logged-in user.

    Endpoints:
    - GET /api/playlists/
    - POST /api/playlists/
    - GET /api/playlists/{id}/
    - PUT /api/playlists/{id}/
    - PATCH /api/playlists/{id}/
    - DELETE /api/playlists/{id}/
    - POST /api/playlists/{id}/tracks/
    - DELETE /api/playlists/{id}/tracks/{song_id}/
    """
    permission_classes = [
        permissions.IsAuthenticated,
        IsOwnerOrReadOnly,
    ]

    def get_serializer_class(self):
        if self.action == 'list':
            return PlaylistListSerializer
        return PlaylistDetailSerializer

    def get_queryset(self):
        user = self.request.user

        return Playlist.objects.filter(
            owner=user,
        ).prefetch_related(
            'tracks',
        ).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        limit = get_playlist_limit_for_user(user)

        if limit is not None and user.playlists.count() >= limit:
            raise exceptions.PermissionDenied(
                f'Your subscription allows a maximum of {limit} playlists.'
            )

        serializer.save(owner=user)

    @action(detail=True, methods=['post'], url_path='tracks')
    def add_track(self, request, pk=None):
        """
        Adds an approved song to the playlist.
        """
        playlist = self.get_object()

        song_id = request.data.get('song_id')

        if not song_id:
            raise exceptions.ValidationError('song_id is required.')

        song = get_object_or_404(Song, id=song_id, approved=True)

        if playlist.tracks.filter(song=song).exists():
            raise exceptions.ValidationError('This song is already in the playlist.')

        max_position = playlist.tracks.aggregate(
            max_position=Max('position'),
        )['max_position']

        next_position = (max_position or 0) + 1

        track = PlaylistTrack.objects.create(
            playlist=playlist,
            song=song,
            position=next_position,
        )

        serializer = PlaylistTrackSerializer(track)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        methods=['delete'],
        url_path=r'tracks/(?P<song_id>[0-9]+)',
    )
    def remove_track(self, request, pk=None, song_id=None):
        """
        Removes a song from the playlist.
        """
        playlist = self.get_object()

        track = get_object_or_404(
            PlaylistTrack,
            playlist=playlist,
            song_id=song_id,
        )

        track.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)