from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework import exceptions, mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from music.models import Song
from subscriptions.models import UserSubscription

from .models import SongPlay
from .serializers import SongPlaySerializer


STREAM_LIMITS = {
    'free': 60,
    'silver': 100,
    'gold': None,
}


def get_stream_limit_for_user(user):
    """
    Returns the daily stream limit based on the user's active subscription tier.

    Rules:
    - Non-listener accounts have no stream limit.
    - Listeners with an active subscription use their plan tier.
    - Listeners without an active subscription use the free limit.
    - Gold means unlimited, represented by None.
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
        return STREAM_LIMITS.get(
            subscription.plan.tier,
            STREAM_LIMITS['free'],
        )

    return STREAM_LIMITS['free']


def get_today_start():
    """
    Returns today's starting time in the server timezone.
    """
    return timezone.now().replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )


class SongPlayViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    Endpoints for recording and viewing listening history.

    Users can:
    - GET their own listening history
    - POST a new play event
    - GET their daily stream limit status

    They cannot edit or delete playback history.

    Endpoints:
    - GET /api/tracking/plays/
    - POST /api/tracking/plays/
    - GET /api/tracking/plays/{id}/
    - GET /api/tracking/plays/daily-status/
    """
    serializer_class = SongPlaySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see their own listening history.
        return SongPlay.objects.filter(
            user=self.request.user,
        ).select_related(
            'song',
            'playlist',
        ).order_by('-created_at')

    @action(detail=False, methods=['get'], url_path='daily-status')
    def daily_status(self, request):
        """
        Returns the current user's daily stream usage and limit.
        """
        user = request.user
        limit = get_stream_limit_for_user(user)

        used_today = SongPlay.objects.filter(
            user=user,
            created_at__gte=get_today_start(),
        ).count()

        remaining = None if limit is None else max(0, limit - used_today)

        return Response({
            'role': user.role,
            'tier': user.tier,
            'daily_limit': limit,
            'used_today': used_today,
            'remaining': remaining,
            'unlimited': limit is None,
        })

    def perform_create(self, serializer):
        """
        Records a play event, enforces the daily stream limit,
        and increases the song's total stream count.
        """
        user = self.request.user
        limit = get_stream_limit_for_user(user)

        with transaction.atomic():
            if limit is not None:
                used_today = SongPlay.objects.filter(
                    user=user,
                    created_at__gte=get_today_start(),
                ).count()

                if used_today >= limit:
                    raise exceptions.PermissionDenied(
                        f'You have reached your daily stream limit of {limit} songs.'
                    )

            play = serializer.save(user=user)

            if play.song:
                # Increase stream count safely at the database level.
                Song.objects.filter(pk=play.song.pk).update(
                    streams=F('streams') + 1,
                )

                # Refresh the song so the API response includes the new stream count.
                play.song.refresh_from_db(fields=['streams'])