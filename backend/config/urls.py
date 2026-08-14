from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/music/', include('music.urls')),
    path('api/playlists/', include('playlists.urls')),
    path('api/subscriptions/', include('subscriptions.urls')),
    path('api/support/', include('support.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/tracking/', include('tracking.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)