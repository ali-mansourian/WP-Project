from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PlaylistViewSet

app_name = 'playlists'

router = DefaultRouter()
router.register(r'', PlaylistViewSet, basename='playlist')

urlpatterns = [
    path('', include(router.urls)),
]