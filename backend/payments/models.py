from django.conf import settings
from django.db import models

from subscriptions.models import UserSubscription


class Payment(models.Model):
    """
    Payment record for subscription purchases, renewals, and refunds.

    The payment gateway is mocked for this course project, but the model
    is structured like a real payment ledger.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        REFUNDED = 'refunded', 'Refunded'

    class Method(models.TextChoices):
        CARD = 'card', 'Card'
        PAYPAL = 'paypal', 'PayPal'
        BANK_TRANSFER = 'bank_transfer', 'Bank Transfer'

    class Type(models.TextChoices):
        SUBSCRIPTION_PURCHASE = 'subscription_purchase', 'Subscription Purchase'
        SUBSCRIPTION_RENEWAL = 'subscription_renewal', 'Subscription Renewal'
        REFUND = 'refund', 'Refund'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments',
    )

    subscription = models.ForeignKey(
        UserSubscription,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payments',
    )

    type = models.CharField(
        max_length=30,
        choices=Type.choices,
        default=Type.SUBSCRIPTION_PURCHASE,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    method = models.CharField(
        max_length=20,
        choices=Method.choices,
        default=Method.CARD,
    )

    amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
    )

    currency = models.CharField(
        max_length=3,
        default='USD',
    )

    reference = models.CharField(
        max_length=100,
        unique=True,
    )

    failure_reason = models.CharField(
        max_length=255,
        blank=True,
    )

    refunded_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]

    def __str__(self):
        return f'{self.user.email} - {self.amount} {self.currency}'