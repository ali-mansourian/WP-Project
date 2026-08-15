from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    CurrentSubscriptionView,
    PurchaseSubscriptionView,
    SubscriptionPlanViewSet,
    VerifySubscriptionView,
)


app_name = 'subscriptions'

router = DefaultRouter()
router.register(r'plans', SubscriptionPlanViewSet, basename='subscription-plan')

urlpatterns = [
    path('plans/', SubscriptionPlanViewSet.as_view({'get': 'list', 'post': 'create'}), name='plan-list'),
    path('plans/<int:pk>/', SubscriptionPlanViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='plan-detail'),
    path('current/', CurrentSubscriptionView.as_view(), name='current-subscription'),
    path('purchase/', PurchaseSubscriptionView.as_view(), name='purchase-subscription'),
    path('verify/', VerifySubscriptionView.as_view(), name='verify-subscription'), # <-- ADD THIS LINE
]