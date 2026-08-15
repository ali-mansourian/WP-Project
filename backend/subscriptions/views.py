import calendar
import requests
from django.utils import timezone
from rest_framework import exceptions, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from payments.models import Payment
from .models import SubscriptionPlan, UserSubscription
from .serializers import SubscriptionPlanSerializer, UserSubscriptionSerializer

def add_months(value, months):
    month = value.month - 1 + months
    year = value.year + month // 12
    month = month % 12 + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return value.replace(year=year, month=month, day=day)

class IsAdminRoleOrStaff(permissions.BasePermission):
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

# --- ZARINPAL SANDBOX CONFIGURATION ---
ZARINPAL_REQUEST_URL = 'https://sandbox.zarinpal.com/pg/v4/payment/request.json'
ZARINPAL_VERIFY_URL = 'https://sandbox.zarinpal.com/pg/v4/payment/verify.json'
ZARINPAL_START_PAY_URL = 'https://sandbox.zarinpal.com/pg/StartPay/'
MERCHANT_ID = 'c8d2f8b6-07c1-496c-9f4c-f8e8afae1955' # TA provided UUID

class PurchaseSubscriptionView(APIView):
    """
    Requests a payment URL from Zarinpal Sandbox.
    Endpoint: POST /api/subscriptions/purchase/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        if not plan_id:
            raise exceptions.ValidationError('plan_id is required.')

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            raise exceptions.NotFound('Subscription plan not found.')

        # Zarinpal expects amount in Tomans. 
        # We multiply USD price by 50000 for sandbox realism (e.g. $3 -> 150,000 Tomans)
        amount_toman = str(int(plan.price * 50000))

        payload = {
            "merchant_id": MERCHANT_ID,
            "amount": amount_toman,
            "description": f"SoundWave {plan.tier.capitalize()} Subscription",
            "callback_url": "http://localhost:3000/payment/verify"
        }

        try:
            response = requests.post(ZARINPAL_REQUEST_URL, json=payload, timeout=10)
            data = response.json()
        except Exception as e:
            return Response({'error': f'Zarinpal request failed: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)

        if data.get('data', {}).get('code') == 100:
            authority = data['data']['authority']
            payment_url = f"{ZARINPAL_START_PAY_URL}{authority}"
            
            return Response({
                'payment_url': payment_url,
                'authority': authority,
                'plan_id': plan.id
            }, status=status.HTTP_200_OK)
        else:
            error_msg = data.get('errors', {}).get('message', 'Unknown Zarinpal error')
            return Response({'error': f'Zarinpal error: {error_msg}'}, status=status.HTTP_400_BAD_REQUEST)


class VerifySubscriptionView(APIView):
    """
    Verifies the Zarinpal payment callback and activates the subscription.
    Endpoint: POST /api/subscriptions/verify/
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        authority = request.data.get('authority')
        plan_id = request.data.get('plan_id')
        zarinpal_status = request.data.get('status') # 'OK' or 'NOK'

        if not authority or not plan_id:
            raise exceptions.ValidationError('authority and plan_id are required.')

        if zarinpal_status != 'OK':
            return Response({'error': 'Payment was cancelled or failed.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            raise exceptions.NotFound('Subscription plan not found.')

        # Verify with Zarinpal
        amount_toman = str(int(plan.price * 50000))
        payload = {
            "merchant_id": MERCHANT_ID,
            "amount": amount_toman,
            "authority": authority
        }

        try:
            response = requests.post(ZARINPAL_VERIFY_URL, json=payload, timeout=10)
            data = response.json()
        except Exception as e:
            return Response({'error': f'Zarinpal verify failed: {str(e)}'}, status=status.HTTP_502_BAD_GATEWAY)

        # Code 100 = success, 101 = already verified
        if data.get('data', {}).get('code') in [100, 101]:
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

            subscription = UserSubscription.objects.create(
                user=request.user,
                plan=plan,
                status=UserSubscription.Status.ACTIVE,
                start_date=now,
                end_date=end_date,
                price_paid=plan.price,
                payment_reference=authority,
            )

            Payment.objects.create(
                user=request.user,
                subscription=subscription,
                type=Payment.Type.SUBSCRIPTION_PURCHASE,
                status=Payment.Status.COMPLETED,
                method=Payment.Method.CARD,
                amount=plan.price,
                currency='USD',
                reference=authority,
            )

            request.user.tier = plan.tier
            request.user.save(update_fields=['tier', 'updated_at'])

            serializer = UserSubscriptionSerializer(subscription)
            return Response({
                'detail': 'Payment verified successfully!', 
                'subscription': serializer.data
            }, status=status.HTTP_201_CREATED)
        else:
            error_msg = data.get('errors', {}).get('message', 'Verification failed')
            return Response({'error': f'Zarinpal verification failed: {error_msg}'}, status=status.HTTP_400_BAD_REQUEST)