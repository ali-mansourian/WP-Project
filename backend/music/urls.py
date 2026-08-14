from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AlbumViewSet, SongViewSet

app_name = 'music'

router = DefaultRouter()
router.register(r'songs', SongViewSet, basename='song')
router.register(r'albums', AlbumViewSet, basename='album')

urlpatterns = [
    path('', include(router.urls)),
]