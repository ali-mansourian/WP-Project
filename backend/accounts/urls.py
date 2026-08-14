from django.urls import path

from .views import (
    LoginView,
    LogoutView,
    MeView,
    RegisterArtistView,
    RegisterListenerView,
)

app_name = 'accounts'

urlpatterns = [
    path('register/listener/', RegisterListenerView.as_view(), name='register-listener'),
    path('register/artist/', RegisterArtistView.as_view(), name='register-artist'),
    path('login/', LoginView.as_view(), name='login'),
    path('me/', MeView.as_view(), name='me'),
    path('logout/', LogoutView.as_view(), name='logout'),
]