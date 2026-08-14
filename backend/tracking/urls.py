from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SongPlayViewSet

app_name = 'tracking'

router = DefaultRouter()
router.register(r'plays', SongPlayViewSet, basename='songplay')

urlpatterns = [
    path('', include(router.urls)),
]