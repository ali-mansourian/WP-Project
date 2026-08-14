from datetime import timedelta
from decimal import Decimal

from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from subscriptions.models import SubscriptionPlan, UserSubscription
from .models import Payment


class PaymentTests(APITestCase):
    def setUp(self):
        self.payment_list_url = reverse('payments:payment-list')

        self.listener = User.objects.create_user(
            email='listener@example.com',
            password='StrongPass123!',
            name='Listener',
            role='listener',
            tier='free',
        )

        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='StrongPass123!',
            name='Other User',
            role='listener',
            tier='free',
        )

        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='StrongPass123!',
            name='Admin',
            role='admin',
            is_staff=True,
        )

        self.plan = SubscriptionPlan.objects.create(
            tier='silver',
            duration_months=1,
            price=Decimal('2.99'),
            playlist_limit=5,
            is_active=True,
        )

        self.authenticate(self.listener)

    def authenticate(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def detail_url(self, payment_id):
        return reverse('payments:payment-detail', args=[payment_id])

    def refund_url(self, payment_id):
        return reverse('payments:payment-refund', args=[payment_id])

    def create_payment(
        self,
        user,
        reference,
        subscription=None,
        payment_type=Payment.Type.SUBSCRIPTION_PURCHASE,
        payment_status=Payment.Status.COMPLETED,
        amount=Decimal('2.99'),
    ):
        return Payment.objects.create(
            user=user,
            subscription=subscription,
            type=payment_type,
            status=payment_status,
            method=Payment.Method.CARD,
            amount=amount,
            currency='USD',
            reference=reference,
        )

    def create_active_subscription(self, user, plan, payment_reference):
        now = timezone.now()

        return UserSubscription.objects.create(
            user=user,
            plan=plan,
            status=UserSubscription.Status.ACTIVE,
            start_date=now,
            end_date=now + timedelta(days=30),
            price_paid=plan.price,
            payment_reference=payment_reference,
        )

    def test_unauthenticated_user_cannot_list_payments(self):
        self.client.credentials()

        response = self.client.get(self.payment_list_url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_can_list_own_payments_only(self):
        self.create_payment(self.listener, reference='PAY-1')
        self.create_payment(self.other_user, reference='PAY-2')

        response = self.client.get(self.payment_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        references = [payment['reference'] for payment in response.data]
        self.assertIn('PAY-1', references)
        self.assertNotIn('PAY-2', references)

    def test_subscription_purchase_creates_payment(self):
        purchase_url = reverse('subscriptions:purchase-subscription')

        response = self.client.post(
            purchase_url,
            {'plan_id': self.plan.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        payment = Payment.objects.get(user=self.listener)

        self.assertEqual(payment.status, Payment.Status.COMPLETED)
        self.assertEqual(payment.type, Payment.Type.SUBSCRIPTION_PURCHASE)
        self.assertEqual(payment.amount, Decimal('2.99'))
        self.assertEqual(payment.reference, response.data['payment_reference'])

    def test_admin_can_view_all_payments(self):
        self.create_payment(self.listener, reference='PAY-1')
        self.create_payment(self.other_user, reference='PAY-2')

        self.authenticate(self.admin)

        response = self.client.get(self.payment_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_admin_can_refund_completed_payment(self):
        subscription = self.create_active_subscription(
            user=self.listener,
            plan=self.plan,
            payment_reference='SUB-1',
        )

        payment = self.create_payment(
            user=self.listener,
            subscription=subscription,
            reference='PAY-1',
        )

        self.listener.tier = 'silver'
        self.listener.save()

        self.authenticate(self.admin)

        response = self.client.post(self.refund_url(payment.id))

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['type'], Payment.Type.REFUND)

        payment.refresh_from_db()
        self.assertEqual(payment.status, Payment.Status.REFUNDED)
        self.assertIsNotNone(payment.refunded_at)

        subscription.refresh_from_db()
        self.assertEqual(subscription.status, UserSubscription.Status.CANCELLED)

        self.listener.refresh_from_db()
        self.assertEqual(self.listener.tier, 'free')

    def test_regular_user_cannot_refund_payment(self):
        payment = self.create_payment(self.listener, reference='PAY-1')

        response = self.client.post(self.refund_url(payment.id))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_cannot_refund_pending_payment(self):
        payment = self.create_payment(
            self.listener,
            reference='PAY-1',
            payment_status=Payment.Status.PENDING,
        )

        self.authenticate(self.admin)

        response = self.client.post(self.refund_url(payment.id))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_refund_refund_payment(self):
        payment = self.create_payment(
            self.listener,
            reference='REFUND-1',
            payment_type=Payment.Type.REFUND,
        )

        self.authenticate(self.admin)

        response = self.client.post(self.refund_url(payment.id))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)