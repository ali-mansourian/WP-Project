from django.utils import timezone
from rest_framework import exceptions, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import SupportReply, SupportTicket
from .serializers import (
    SupportReplySerializer,
    SupportTicketDetailSerializer,
    SupportTicketListSerializer,
)


def is_support_staff(user):
    """
    Returns True for admins, support staff, or Django staff users.
    """
    return bool(
        user
        and user.is_authenticated
        and (
            user.is_staff
            or user.role in ['admin', 'support']
        )
    )


class SupportTicketViewSet(viewsets.ModelViewSet):
    """
    Support ticket endpoints.

    Regular users can:
    - create tickets
    - list their own tickets
    - view their own tickets
    - reply to their own tickets

    Support staff can:
    - view all tickets
    - update ticket status
    - reply to any ticket
    - delete tickets

    Endpoints:
    - GET /api/support/tickets/
    - POST /api/support/tickets/
    - GET /api/support/tickets/{id}/
    - PATCH /api/support/tickets/{id}/
    - DELETE /api/support/tickets/{id}/
    - POST /api/support/tickets/{id}/replies/
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return SupportTicketListSerializer
        return SupportTicketDetailSerializer

    def get_queryset(self):
        user = self.request.user

        queryset = SupportTicket.objects.select_related(
            'user',
            'assigned_to',
        ).prefetch_related(
            'replies',
        ).order_by('-created_at')

        if is_support_staff(user):
            return queryset

        return queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            assigned_to=None,
        )

    def perform_update(self, serializer):
        if not is_support_staff(self.request.user):
            raise exceptions.PermissionDenied(
                'Only support staff can update support tickets.'
            )

        instance = serializer.instance
        new_status = serializer.validated_data.get('status', instance.status)

        if new_status in [
            SupportTicket.Status.OPEN,
            SupportTicket.Status.IN_PROGRESS,
        ]:
            serializer.save(resolved_at=None)
        elif new_status in [
            SupportTicket.Status.RESOLVED,
            SupportTicket.Status.CLOSED,
        ] and not instance.resolved_at:
            serializer.save(resolved_at=timezone.now())
        else:
            serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if not (instance.user == user or is_support_staff(user)):
            raise exceptions.PermissionDenied(
                'You cannot delete this support ticket.'
            )

        instance.delete()

    @action(detail=True, methods=['post'], url_path='replies')
    def reply(self, request, pk=None):
        """
        Adds a reply to a support ticket.
        """
        ticket = self.get_object()

        message = request.data.get('message')

        if not message:
            raise exceptions.ValidationError('message is required.')

        reply = SupportReply.objects.create(
            ticket=ticket,
            author=request.user,
            message=message,
        )

        # If support staff reply to an open ticket, move it to in progress.
        if is_support_staff(request.user) and ticket.status == SupportTicket.Status.OPEN:
            ticket.status = SupportTicket.Status.IN_PROGRESS
            ticket.save(update_fields=['status', 'updated_at'])

        serializer = SupportReplySerializer(reply)

        return Response(serializer.data, status=status.HTTP_201_CREATED)