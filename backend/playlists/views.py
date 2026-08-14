from rest_framework import exceptions, permissions, viewsets

from .models import Playlist
from .serializers import PlaylistDetailSerializer, PlaylistListSerializer

PLAYLIST_LIMITS = {
    'free': 2,
    'silver': 5,
    'gold': 10,
}


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

        if user.role == 'listener':
            limit = PLAYLIST_LIMITS.get(user.tier, PLAYLIST_LIMITS['free'])

            if user.playlists.count() >= limit:
                raise exceptions.PermissionDenied(
                    f"Your {user.tier} subscription allows a maximum of {limit} playlists."
                )

        serializer.save(owner=user)