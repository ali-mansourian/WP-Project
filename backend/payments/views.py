import uuid

from django.utils import timezone
from rest_framework import exceptions, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from subscriptions.models import UserSubscription

from .models import Payment
from .serializers import PaymentSerializer


def is_admin_or_staff(user):
    """
    Returns True for admins or Django staff users.
    """
    return bool(
        user
        and user.is_authenticated
        and (
            user.is_staff
            or user.role == 'admin'
        )
    )


class IsAdminRoleOrStaff(permissions.BasePermission):
    """
    Allows access only to admins or Django staff users.
    """

    def has_permission(self, request, view):
        return is_admin_or_staff(request.user)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Payment history endpoints.

    Regular users can view their own payments.
    Admins/staff can view all payments and issue refunds.

    Endpoints:
    - GET /api/payments/
    - GET /api/payments/{id}/
    - POST /api/payments/{id}/refund/
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        queryset = Payment.objects.select_related(
            'subscription',
            'subscription__plan',
            'user',
        ).order_by('-created_at')

        if not is_admin_or_staff(user):
            queryset = queryset.filter(user=user)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        type_filter = self.request.query_params.get('type')
        if type_filter:
            queryset = queryset.filter(type=type_filter)

        return queryset

    @action(
        detail=True,
        methods=['post'],
        url_path='refund',
        permission_classes=[IsAdminRoleOrStaff],
    )
    def refund(self, request, pk=None):
        """
        Refunds a completed payment using the mock payment gateway.

        This also cancels the related subscription and returns the user
        to the free tier.
        """
        payment = self.get_object()

        if payment.type == Payment.Type.REFUND:
            raise exceptions.ValidationError('Refund payments cannot be refunded.')

        if payment.status != Payment.Status.COMPLETED:
            raise exceptions.ValidationError(
                'Only completed payments can be refunded.'
            )

        now = timezone.now()
        refund_reference = f'REFUND-{uuid.uuid4().hex[:12].upper()}'

        refund_payment = Payment.objects.create(
            user=payment.user,
            subscription=payment.subscription,
            type=Payment.Type.REFUND,
            status=Payment.Status.COMPLETED,
            method=payment.method,
            amount=payment.amount,
            currency=payment.currency,
            reference=refund_reference,
        )

        payment.status = Payment.Status.REFUNDED
        payment.refunded_at = now
        payment.save(update_fields=['status', 'refunded_at', 'updated_at'])

        # If the payment is connected to an active subscription,
        # cancel it and move the user back to the free tier.
        subscription = payment.subscription

        if subscription and subscription.status == UserSubscription.Status.ACTIVE:
            subscription.status = UserSubscription.Status.CANCELLED
            subscription.end_date = now
            subscription.save(update_fields=['status', 'end_date', 'updated_at'])

            user = subscription.user
            user.tier = 'free'
            user.save(update_fields=['tier', 'updated_at'])

        serializer = self.get_serializer(refund_payment)

        return Response(serializer.data, status=201)