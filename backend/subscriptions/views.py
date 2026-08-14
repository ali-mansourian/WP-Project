import calendar
import uuid

from django.utils import timezone
from rest_framework import exceptions, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from payments.models import Payment

from .models import SubscriptionPlan, UserSubscription
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer


def add_months(value, months):
    """
    Adds a number of calendar months to a datetime.

    Example:
        2026-06-15 + 3 months = 2026-09-15
    """
    month = value.month - 1 + months
    year = value.year + month // 12
    month = month % 12 + 1
    day = min(value.day, calendar.monthrange(year, month)[1])

    return value.replace(year=year, month=month, day=day)


class IsAdminRoleOrStaff(permissions.BasePermission):
    """
    Allows access to admin users or Django staff users.
    """

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and (
                user.is_staff
                or getattr(user, 'role', None) == 'admin'
            )
        )


class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    """
    Subscription plan endpoints.

    Public users can list/read active plans.
    Admins can create, update, and delete plans.

    Endpoints:
    - GET /api/subscriptions/plans/
    - GET /api/subscriptions/plans/{id}/
    - POST /api/subscriptions/plans/
    - PUT /api/subscriptions/plans/{id}/
    - PATCH /api/subscriptions/plans/{id}/
    - DELETE /api/subscriptions/plans/{id}/
    """
    serializer_class = SubscriptionPlanSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]

        return [IsAdminRoleOrStaff()]

    def get_queryset(self):
        user = self.request.user

        queryset = SubscriptionPlan.objects.all()

        if user.is_authenticated and (
            user.is_staff or getattr(user, 'role', None) == 'admin'
        ):
            return queryset

        return queryset.filter(is_active=True)


class CurrentSubscriptionView(APIView):
    """
    Returns the current authenticated user's active subscription.

    Endpoint:
    - GET /api/subscriptions/current/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        subscription = UserSubscription.objects.filter(
            user=request.user,
            status=UserSubscription.Status.ACTIVE,
        ).order_by('-created_at').first()

        if subscription and subscription.is_currently_active:
            serializer = UserSubscriptionSerializer(subscription)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            {
                'detail': 'No active subscription.',
                'subscription': None,
                'tier': request.user.tier,
            },
            status=status.HTTP_200_OK,
        )


class PurchaseSubscriptionView(APIView):
    """
    Purchases a subscription plan using a mock payment gateway.

    Endpoint:
    - POST /api/subscriptions/purchase/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')

        if not plan_id:
            raise exceptions.ValidationError('plan_id is required.')

        try:
            plan = SubscriptionPlan.objects.get(
                id=plan_id,
                is_active=True,
            )
        except SubscriptionPlan.DoesNotExist:
            raise exceptions.NotFound('Subscription plan not found.')

        now = timezone.now()
        end_date = add_months(now, plan.duration_months)

        # Expire any currently active subscriptions before creating the new one.
        UserSubscription.objects.filter(
            user=request.user,
            status=UserSubscription.Status.ACTIVE,
        ).update(
            status=UserSubscription.Status.EXPIRED,
            updated_at=now,
        )

        payment_reference = f'MOCK-{uuid.uuid4().hex[:12].upper()}'

        subscription = UserSubscription.objects.create(
            user=request.user,
            plan=plan,
            status=UserSubscription.Status.ACTIVE,
            start_date=now,
            end_date=end_date,
            price_paid=plan.price,
            payment_reference=payment_reference,
        )

        # Record the completed payment in the payment ledger.
        Payment.objects.create(
            user=request.user,
            subscription=subscription,
            type=Payment.Type.SUBSCRIPTION_PURCHASE,
            status=Payment.Status.COMPLETED,
            method=Payment.Method.CARD,
            amount=plan.price,
            currency='USD',
            reference=payment_reference,
        )

        # Update the user's tier so playlist limits and UI can use it.
        request.user.tier = plan.tier
        request.user.save(update_fields=['tier', 'updated_at'])

        serializer = UserSubscriptionSerializer(subscription)

        return Response(serializer.data, status=status.HTTP_201_CREATED)