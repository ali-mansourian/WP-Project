from django.conf import settings
from django.db import models


class SupportTicket(models.Model):
    """
    Support ticket submitted by a user.

    Users can submit tickets about accounts, subscriptions, payments,
    playback, artist pages, or other issues.
    Admins/support staff can update the status and reply.
    """

    class Category(models.TextChoices):
        ACCOUNT = 'account', 'Account'
        SUBSCRIPTION = 'subscription', 'Subscription'
        PAYMENT = 'payment', 'Payment'
        PLAYBACK = 'playback', 'Playback'
        ARTIST = 'artist', 'Artist'
        OTHER = 'other', 'Other'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        RESOLVED = 'resolved', 'Resolved'
        CLOSED = 'closed', 'Closed'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='support_tickets',
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_support_tickets',
    )

    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.OTHER,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
    )

    subject = models.CharField(max_length=255)
    message = models.TextField()

    attachment = models.FileField(
        upload_to='support_attachments/',
        null=True,
        blank=True,
    )

    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.subject


class SupportReply(models.Model):
    """
    Reply to a support ticket.

    Replies can come from the ticket owner or from staff/admin users.
    """
    ticket = models.ForeignKey(
        SupportTicket,
        on_delete=models.CASCADE,
        related_name='replies',
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='support_replies',
    )

    message = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Reply on {self.ticket.subject}'