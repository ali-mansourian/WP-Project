from django.conf import settings
from django.db import models


class ArtistSettlement(models.Model):
    """
    Monthly financial settlement record for an artist.
    Tracks streams, unique listeners, and the payout amount.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SETTLED = 'settled', 'Settled'

    artist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='settlements',
    )
    
    # Stores the month and year of the settlement period (e.g., 2026-08-01)
    period = models.DateField()
    
    total_streams = models.PositiveIntegerField(default=0)
    unique_listeners = models.PositiveIntegerField(default=0)
    
    # Calculated payout amount
    amount_due = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0.00,
    )
    
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    settled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-period', 'artist']
        constraints = [
            models.UniqueConstraint(
                fields=['artist', 'period'],
                name='unique_settlement_per_artist_per_month',
            ),
        ]

    def __str__(self):
        return f"{self.artist.email} - {self.period.strftime('%Y-%m')} - {self.status}"