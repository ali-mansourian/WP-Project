from django.utils import timezone
from rest_framework import exceptions, mixins, permissions, viewsets

from subscriptions.models import UserSubscription

from .models import SongPlay
from .serializers import SongPlaySerializer

STREAM_LIMITS = {
    'free': 60,
    'silver': 100,
    'gold': float('inf'),
}


def get_stream_limit_for_user(user):
    """
    Returns the daily stream limit based on the user's active subscription tier.
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
        tier = subscription.plan.tier
        return STREAM_LIMITS.get(tier, STREAM_LIMITS['free'])

    return STREAM_LIMITS['free']


class SongPlayViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet
):
    """
    Endpoints for recording and viewing listening history.
    
    Users can list their history and record a new play, but they 
    cannot edit or delete their historical playback data.
    
    Endpoints:
    - GET /api/tracking/plays/
    - POST /api/tracking/plays/
    - GET /api/tracking/plays/{id}/
    """
    serializer_class = SongPlaySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own listening history
        return SongPlay.objects.filter(
            user=self.request.user
        ).select_related(
            'song',
            'playlist',
        ).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        limit = get_stream_limit_for_user(user)

        if limit is not None and limit != float('inf'):
            # Count how many songs the user played today
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            today_plays = SongPlay.objects.filter(
                user=user,
                created_at__gte=today_start
            ).count()

            if today_plays >= limit:
                raise exceptions.PermissionDenied(
                    f"You have reached your daily stream limit of {limit} songs."
                )

        serializer.save(user=user)