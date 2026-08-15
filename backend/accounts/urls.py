from django.urls import path
from .views import (
    AdminArtistViewSet,
    AdminUserListView,
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
    
    # Admin/Support Artist Management
    path('admin/artists/', AdminArtistViewSet.as_view({'get': 'list'}), name='admin-artist-list'),
    path('admin/artists/<int:pk>/approve/', AdminArtistViewSet.as_view({'post': 'approve'}), name='admin-artist-approve'),
    path('admin/artists/<int:pk>/reject/', AdminArtistViewSet.as_view({'post': 'reject'}), name='admin-artist-reject'),
    
    # Admin User Management
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
]