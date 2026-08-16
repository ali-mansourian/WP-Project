from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from notifications.models import Notification
from .serializers import AdminUserSerializer
from rest_framework import permissions, status, viewsets
from .models import User
from rest_framework.views import APIView
from .models import UserPreferences
from .serializers import UserPreferencesSerializer
from django.db import models
from .models import Follow


from .serializers import (
    LoginSerializer,
    RegisterArtistSerializer,
    RegisterListenerSerializer,
    UserSerializer,
)


class RegisterListenerView(APIView):
    """
    Register a new listener account.
    Listeners are activated immediately.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterListenerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class RegisterArtistView(APIView):
    """
    Register a new artist account.
    Artist accounts are created with status 'pending'.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterArtistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)

        staff_users = User.objects.filter(
            models.Q(role__in=['admin', 'support']) | models.Q(is_staff=True)
        ).distinct()

        for staff in staff_users:
            Notification.objects.create(
                user=staff,
                type='artist',
                title='New Artist Verification Request',
                message=f'Artist "{user.stage_name or user.name}" submitted a new registration awaiting portfolio audit.',
                link='/admin-dashboard',
            )

        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    Login with email and password.
    Returns an authentication token and user data.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    """
    Return or update the currently authenticated user's profile.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    def delete(self, request):
        """
        Permanently deletes the authenticated user's account.
        Related playlists, tickets, notifications, and songs are cascade-deleted.
        """
        user = request.user
        user.delete()
        return Response(
            {'detail': 'Account deleted successfully.'},
            status=status.HTTP_200_OK,
        )
class UserPreferencesView(APIView):
    """
    Get or update the authenticated user's app preferences.
    Automatically creates preferences with defaults if they don't exist yet.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        preferences, _ = UserPreferences.objects.get_or_create(user=request.user)
        serializer = UserPreferencesSerializer(preferences)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        preferences, _ = UserPreferences.objects.get_or_create(user=request.user)
        serializer = UserPreferencesSerializer(preferences, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

class LogoutView(APIView):
    """
    Logout by deleting the user's authentication token.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        return Response(
            {'detail': 'Successfully logged out.'},
            status=status.HTTP_200_OK,
        )
        
class IsAdminOrSupport(permissions.BasePermission):
    """
    Allows access only to admin or support staff.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ['admin', 'support']
        )

class AdminArtistViewSet(viewsets.ModelViewSet):
    """
    Admin endpoints to manage pending artist applications.
    """
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminOrSupport]

    def get_queryset(self):
        # Only return pending or rejected artists for the approval queue
        return User.objects.filter(
            role='artist',
            status__in=['pending', 'rejected']
        ).order_by('-joined_date')

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        user = self.get_object()
        user.status = 'active'
        user.rejection_reason = ''
        user.save(update_fields=['status', 'rejection_reason', 'updated_at'])

        # Create notification for the artist
        Notification.objects.create(
            user=user,
            type='artist',
            title='Artist Profile Approved!',
            message=f'Congratulations! Your request to become an artist has been approved. You can now publish tracks as "{user.stage_name}".'
        )
        
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        user = self.get_object()
        reason = request.data.get('reason', 'Incomplete profile details.')
        
        user.status = 'rejected'
        user.rejection_reason = reason
        user.save(update_fields=['status', 'rejection_reason', 'updated_at'])

        # Create notification for the artist
        Notification.objects.create(
            user=user,
            type='artist',
            title='Artist Application Rejected',
            message=f'Your artist request for "{user.stage_name}" was reviewed and declined. Reason: {reason}'
        )
        
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
class IsAdminRoleOrStaff(permissions.BasePermission):
    """
    Allows access only to admin users or Django staff.
    """
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                request.user.is_staff
                or request.user.role == 'admin'
            )
        )


class AdminUserListView(APIView):
    """
    Returns all users for the Admin Dashboard.
    Endpoint: GET /api/auth/admin/users/
    """
    permission_classes = [IsAdminRoleOrStaff]

    def get(self, request):
        users = User.objects.all().order_by('-joined_date')
        serializer = AdminUserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
class FollowView(APIView):
    """
    Follow or unfollow an artist.
    POST /api/auth/follow/<artist_id>/   -> follow
    DELETE /api/auth/follow/<artist_id>/ -> unfollow
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, artist_id):
        try:
            artist = User.objects.get(pk=artist_id, role='artist')
        except User.DoesNotExist:
            return Response(
                {'detail': 'Artist not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        if artist == request.user:
            return Response(
                {'detail': 'You cannot follow yourself.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        Follow.objects.get_or_create(follower=request.user, artist=artist)
        return Response(
            {'detail': 'Followed successfully.', 'following': True},
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, artist_id):
        Follow.objects.filter(follower=request.user, artist_id=artist_id).delete()
        return Response(
            {'detail': 'Unfollowed successfully.', 'following': False},
            status=status.HTTP_200_OK,
        )


class MyFollowsView(APIView):
    """
    Get the current user's follow data.
    GET /api/auth/me/follows/
    Returns: following list, follower_count, following_count
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        following = Follow.objects.filter(follower=user).select_related('artist')
        following_list = [
            {
                'id': f.artist.id,
                'name': f.artist.name,
                'stage_name': f.artist.stage_name,
                'avatar': f.artist.avatar.url if f.artist.avatar else None,
            }
            for f in following
        ]

        follower_count = Follow.objects.filter(artist=user).count()
        following_count = Follow.objects.filter(follower=user).count()

        return Response({
            'following': following_list,
            'follower_count': follower_count,
            'following_count': following_count,
        }, status=status.HTTP_200_OK)
        
        
        
        
class ArtistListView(APIView):
    """
    List all approved artists.
    GET /api/auth/artists/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        artists = User.objects.filter(role='artist', status='active')
        data = [
            {
                'id': a.id,
                'name': a.name,
                'stage_name': a.stage_name,
                'bio': a.bio,
                'avatar': a.avatar.url if a.avatar else None,
                'is_verified_artist': a.is_verified_artist,
            }
            for a in artists
        ]
        return Response(data, status=status.HTTP_200_OK)