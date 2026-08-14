from rest_framework import exceptions, permissions, viewsets

from subscriptions.models import UserSubscription

from .models import Playlist
from .serializers import PlaylistDetailSerializer, PlaylistListSerializer

DEFAULT_FREE_PLAYLIST_LIMIT = 2


def get_playlist_limit_for_user(user):
    """
    Returns the playlist limit for a listener based on their active subscription.

    Rules:
    - Non-listener accounts have no playlist limit.
    - Listeners with an active subscription use the plan's playlist_limit.
    - Listeners without an active subscription get the free limit.
    """
    if user.role != 'listener':
        return None

    subscription = UserSubscription.objects.filter(
        user=user,
        status=UserSubscription.Status.ACTIVE,
    ).select_related(
        'plan',
    ).order_by('-created_at').first()

    if subscription and subscription.is_currently_active:
        return subscription.plan.playlist_limit

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