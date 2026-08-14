from django.conf import settings
from django.db import models
from django.utils import timezone


class SubscriptionPlan(models.Model):
    """
    Subscription plans are controlled by admins.

    Each plan belongs to a tier, has a duration, and has a dynamic price.
    Example:
        Silver, 3 months, $4.99
        Gold, 12 months, $19.99
    """

    class Tier(models.TextChoices):
        FREE = 'free', 'Free'
        SILVER = 'silver', 'Silver'
        GOLD = 'gold', 'Gold'

    class DurationMonths(models.IntegerChoices):
        ONE = 1, '1 Month'
        THREE = 3, '3 Months'
        SIX = 6, '6 Months'
        TWELVE = 12, '12 Months'

    tier = models.CharField(
        max_length=10,
        choices=Tier.choices,
    )
    duration_months = models.PositiveSmallIntegerField(
        choices=DurationMonths.choices,
    )
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
    )
    playlist_limit = models.PositiveIntegerField(
        default=2,
        help_text='Maximum number of playlists allowed for this plan.',
    )
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['tier', 'duration_months']
        constraints = [
            models.UniqueConstraint(
                fields=['tier', 'duration_months'],
                name='unique_plan_per_tier_and_duration',
            ),
        ]

    def __str__(self):
        return f'{self.get_tier_display()} - {self.duration_months} months'


class UserSubscription(models.Model):
    """
    A subscription purchased by a user.

    A user may have multiple subscription records over time,
    but only one should be active at a time.
    """

    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        EXPIRED = 'expired', 'Expired'
        CANCELLED = 'cancelled', 'Cancelled'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions',
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='subscriptions',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)

    price_paid = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
    )
    payment_reference = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def is_currently_active(self):
        if self.status != self.Status.ACTIVE:
            return False

        if self.end_date is None:
            return True

        return timezone.now() <= self.end_date

    def __str__(self):
        return f'{self.user.email} - {self.plan}'