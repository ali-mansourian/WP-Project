from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ListenerStatsView


path('listener/stats/', ListenerStatsView.as_view(), name='listener-stats'),

from .views import (
    AdminPlatformStatsView,
    ArtistSettlementViewSet,
    ArtistStatsView,
)

app_name = 'analytics'

router = DefaultRouter()
router.register(r'settlements', ArtistSettlementViewSet, basename='settlement')

urlpatterns = [
    path('admin/stats/', AdminPlatformStatsView.as_view(), name='admin-stats'),
    path('artist/stats/', ArtistStatsView.as_view(), name='artist-stats'),
    path('', include(router.urls)),
    path('listener/stats/', ListenerStatsView.as_view(), name='listener-stats'),
]