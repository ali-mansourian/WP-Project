from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework import exceptions, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from payments.models import Payment
from tracking.models import SongPlay
from .models import ArtistSettlement
from .serializers import ArtistSettlementSerializer


def is_admin_or_staff(user):
    """
    Returns True for admins or Django staff users.
    """
    return bool(user and user.is_authenticated and (user.is_staff or getattr(user, 'role', None) == 'admin'))


class IsAdminRoleOrStaff(permissions.BasePermission):
    """
    Allows access only to admins or Django staff users.
    """
    def has_permission(self, request, view):
        return is_admin_or_staff(request.user)


class ArtistSettlementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Endpoints for viewing and settling artist payouts.
    Admins see all records; Artists see only their own.

    Endpoints:
    - GET /api/analytics/settlements/
    - POST /api/analytics/settlements/{id}/settle/
    """
    serializer_class = ArtistSettlementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ArtistSettlement.objects.select_related('artist').order_by('-period')
        
        if is_admin_or_staff(user):
            return queryset
        
        if getattr(user, 'role', None) == 'artist':
            return queryset.filter(artist=user)
            
        return queryset.none()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRoleOrStaff])
    def settle(self, request, pk=None):
        """
        Admin only action to mark a pending payout as settled.
        """
        settlement = self.get_object()
        
        if settlement.status == ArtistSettlement.Status.SETTLED:
            raise exceptions.ValidationError("This settlement is already marked as settled.")
            
        settlement.status = ArtistSettlement.Status.SETTLED
        settlement.settled_at = timezone.now()
        settlement.save(update_fields=['status', 'settled_at'])
        
        serializer = self.get_serializer(settlement)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminPlatformStatsView(APIView):
    """
    Aggregated stats for the Admin Dashboard.
    Executes database-level aggregations to calculate totals.

    Endpoint:
    - GET /api/analytics/admin/stats/
    """
    permission_classes = [IsAdminRoleOrStaff]

    def get(self, request):
        now = timezone.now()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Total revenue (all completed subscription purchases, all time)
        total_revenue = Payment.objects.filter(
            status=Payment.Status.COMPLETED,
            type=Payment.Type.SUBSCRIPTION_PURCHASE,
        ).aggregate(total=Sum('amount'))['total'] or 0.00
        
        # Current month earnings
        monthly_earnings = Payment.objects.filter(
            status=Payment.Status.COMPLETED,
            type=Payment.Type.SUBSCRIPTION_PURCHASE,
            created_at__gte=start_of_month
        ).aggregate(total=Sum('amount'))['total'] or 0.00
        
        # Total streams
        total_streams = SongPlay.objects.count()
        
        # User counts by role
        role_counts = {}
        for role_data in User.objects.values('role').annotate(count=Count('id')):
            role_counts[role_data['role']] = role_data['count']
        
        # Tier distribution for listeners (for the pie chart)
        tier_distribution = list(
            User.objects.filter(role='listener')
            .values('tier')
            .annotate(count=Count('id'))
        )
        
        return Response({
            'total_revenue': total_revenue,
            'current_month_earnings': monthly_earnings,
            'total_streams': total_streams,
            'role_counts': role_counts,
            'tier_distribution': tier_distribution,
            'total_users': User.objects.count(),
            'total_active_artists': User.objects.filter(role='artist', status='active').count(),
            'total_pending_artists': User.objects.filter(role='artist', status='pending').count(),
        }, status=status.HTTP_200_OK)


class ArtistStatsView(APIView):
    """
    Aggregated live stats for the logged-in artist's dashboard.

    Endpoint:
    - GET /api/analytics/artist/stats/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if getattr(user, 'role', None) != 'artist':
            raise exceptions.PermissionDenied("Only artists can view these statistics.")
            
        # Compute streams and unique listeners at the database level
        stats = SongPlay.objects.filter(
            song__artist=user
        ).aggregate(
            total_streams=Count('id'),
            unique_listeners=Count('user', distinct=True)
        )
        
        return Response({
            'total_streams': stats['total_streams'] or 0,
            'unique_listeners': stats['unique_listeners'] or 0
        }, status=status.HTTP_200_OK)