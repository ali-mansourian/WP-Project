from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class UserRole(models.TextChoices):
    LISTENER = 'listener', 'Listener'
    ARTIST = 'artist', 'Artist'
    SUPPORT = 'support', 'Support Agent'
    ADMIN = 'admin', 'Admin'


class ListenerTier(models.TextChoices):
    FREE = 'free', 'Free'
    SILVER = 'silver', 'Silver'
    GOLD = 'gold', 'Gold'


class AccountStatus(models.TextChoices):
    ACTIVE = 'active', 'Active'
    PENDING = 'pending', 'Pending Approval'
    REJECTED = 'rejected', 'Rejected'


class User(AbstractUser):
    """
    Custom user model for the music streaming platform.
    Supports four roles: listener, artist, support, admin.
    """

    # Remove default username field; we use email as the unique identifier
    username = None
    email = models.EmailField(unique=True, db_index=True)

    # Display name
    name = models.CharField(max_length=255, blank=True)

    # Role and subscription
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.LISTENER,
    )
    tier = models.CharField(
        max_length=20,
        choices=ListenerTier.choices,
        default=ListenerTier.FREE,
    )

    # Profile
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True)
    
    # App preferences (volume, language, notifications, etc.)
    preferences = models.JSONField(default=dict, blank=True)

    # Account status, mainly used for artist approval workflow
    status = models.CharField(
        max_length=20,
        choices=AccountStatus.choices,
        default=AccountStatus.ACTIVE,
    )
    rejection_reason = models.TextField(blank=True)

    # Artist-specific fields
    stage_name = models.CharField(max_length=255, blank=True)
    is_verified_artist = models.BooleanField(default=False)

    # Timestamps
    joined_date = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use the custom manager because email replaces username
    objects = UserManager()

    # Django auth configuration
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    class Meta:
        ordering = ['-joined_date']

    def __str__(self):
        return f"{self.name or self.email} ({self.role})"

    @property
    def display_name(self):
        return self.name or self.stage_name or self.email
class UserPreferences(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='app_preferences',
    )
    
    stream_quality = models.CharField(
        max_length=20,
        choices=[('standard', 'Standard'), ('hi-fi', 'High Fidelity'), ('spatial', 'Lossless Spatial')],
        default='standard',
    )
    app_volume = models.IntegerField(default=80)
    hardware_acceleration = models.BooleanField(default=True)
    auto_lyrics_scroll = models.BooleanField(default=True)
    language = models.CharField(max_length=10, default='en-US')
    notif_releases = models.BooleanField(default=True)
    notif_playlists = models.BooleanField(default=True)
    notif_system = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Preferences for {self.user.email}"