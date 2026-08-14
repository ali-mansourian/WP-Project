from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import User
from .models import SubscriptionPlan, UserSubscription


class SubscriptionTests(APITestCase):
    def setUp(self):
        self.plan_list_url = reverse('subscriptions:subscription-plan-list')
        self.current_subscription_url = reverse('subscriptions:current-subscription')
        self.purchase_url = reverse('subscriptions:purchase-subscription')

        self.listener = User.objects.create_user(
            email='listener@example.com',
            password='StrongPass123!',
            name='Listener',
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

        self.active_plan = SubscriptionPlan.objects.create(
            tier='silver',
            duration_months=1,
            price=Decimal('2.99'),
            playlist_limit=5,
            is_active=True,
        )

        self.inactive_plan = SubscriptionPlan.objects.create(
            tier='gold',
            duration_months=3,
            price=Decimal('9.99'),
            playlist_limit=10,
            is_active=False,
        )

    def authenticate(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {token.key}')

    def test_public_plan_list_returns_active_plans_only(self):
        response = self.client.get(self.plan_list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        tiers = [plan['tier'] for plan in response.data]
        self.assertIn('silver', tiers)
        self.assertNotIn('gold', tiers)

    def test_admin_can_create_plan(self):
        self.authenticate(self.admin)

        payload = {
            'tier': 'gold',
            'duration_months': 12,
            'price': '19.99',
            'playlist_limit': 10,
            'is_active': True,
        }

        response = self.client.post(self.plan_list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            SubscriptionPlan.objects.filter(
                tier='gold',
                duration_months=12,
            ).exists()
        )

    def test_listener_cannot_create_plan(self):
        self.authenticate(self.listener)

        payload = {
            'tier': 'gold',
            'duration_months': 12,
            'price': '19.99',
            'playlist_limit': 10,
            'is_active': True,
        }

        response = self.client.post(self.plan_list_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_purchase_subscription_success(self):
        self.authenticate(self.listener)

        payload = {'plan_id': self.active_plan.id}
        response = self.client.post(self.purchase_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.listener.refresh_from_db()
        self.assertEqual(self.listener.tier, 'silver')

        self.assertEqual(response.data['status'], 'active')
        self.assertEqual(response.data['plan']['tier'], 'silver')
        self.assertEqual(response.data['price_paid'], '2.99')
        self.assertTrue(response.data['payment_reference'].startswith('MOCK-'))

    def test_purchase_requires_plan_id(self):
        self.authenticate(self.listener)

        response = self.client.post(self.purchase_url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_purchase_inactive_plan_fails(self):
        self.authenticate(self.listener)

        payload = {'plan_id': self.inactive_plan.id}
        response = self.client.post(self.purchase_url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_current_subscription_without_purchase(self):
        self.authenticate(self.listener)

        response = self.client.get(self.current_subscription_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['subscription'])
        self.assertEqual(response.data['tier'], 'free')

    def test_current_subscription_after_purchase(self):
        self.authenticate(self.listener)

        self.client.post(
            self.purchase_url,
            {'plan_id': self.active_plan.id},
            format='json',
        )

        response = self.client.get(self.current_subscription_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'active')
        self.assertEqual(response.data['plan']['tier'], 'silver')

    def test_new_purchase_expires_old_subscription(self):
        self.authenticate(self.listener)

        gold_plan = SubscriptionPlan.objects.create(
            tier='gold',
            duration_months=1,
            price=Decimal('4.99'),
            playlist_limit=10,
            is_active=True,
        )

        self.client.post(
            self.purchase_url,
            {'plan_id': self.active_plan.id},
            format='json',
        )

        self.client.post(
            self.purchase_url,
            {'plan_id': gold_plan.id},
            format='json',
        )

        subscriptions = UserSubscription.objects.filter(
            user=self.listener,
        ).order_by('-created_at')

        self.assertEqual(subscriptions.count(), 2)
        self.assertEqual(subscriptions[0].status, UserSubscription.Status.ACTIVE)
        self.assertEqual(subscriptions[1].status, UserSubscription.Status.EXPIRED)

        self.listener.refresh_from_db()
        self.assertEqual(self.listener.tier, 'gold')