from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CurrentSubscriptionView,
    PurchaseSubscriptionView,
    SubscriptionPlanViewSet,
)

app_name = 'subscriptions'

router = DefaultRouter()
router.register(r'plans', SubscriptionPlanViewSet, basename='subscription-plan')

urlpatterns = [
    path('current/', CurrentSubscriptionView.as_view(), name='current-subscription'),
    path('purchase/', PurchaseSubscriptionView.as_view(), name='purchase-subscription'),
    path('', include(router.urls)),
]