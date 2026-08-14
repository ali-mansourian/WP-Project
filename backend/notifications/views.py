from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Notification endpoints for the logged-in user.

    Endpoints:
    - GET /api/notifications/
    - GET /api/notifications/?unread_only=true
    - GET /api/notifications/{id}/
    - GET /api/notifications/unread-count/
    - POST /api/notifications/{id}/read/
    - POST /api/notifications/mark-all-read/
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)

        unread_only = self.request.query_params.get('unread_only')

        if unread_only in ['1', 'true', 'True']:
            queryset = queryset.filter(read=False)

        return queryset

    @action(detail=False, methods=['get'], url_path='unread-count')
    def unread_count(self, request):
        """
        Returns the number of unread notifications for the current user.
        """
        count = request.user.notifications.filter(read=False).count()

        return Response({'unread_count': count})

    @action(detail=True, methods=['post'], url_path='read')
    def mark_read(self, request, pk=None):
        """
        Marks a single notification as read.
        """
        notification = self.get_object()

        if not notification.read:
            notification.read = True
            notification.save(update_fields=['read'])

        serializer = self.get_serializer(notification)

        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='mark-all-read')
    def mark_all_read(self, request):
        """
        Marks all notifications for the current user as read.
        """
        updated = request.user.notifications.filter(read=False).update(read=True)

        return Response({'marked_read': updated})