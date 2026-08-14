from django.conf import settings
from django.db import models


class Album(models.Model):
    """
    Album model.

    An album belongs to one artist and can contain multiple songs.
    """
    title = models.CharField(max_length=255)
    artist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='albums',
    )
    cover = models.ImageField(
        upload_to='album_covers/',
        null=True,
        blank=True,
    )
    release_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Song(models.Model):
    """
    Song model.

    A song belongs to one artist and optionally belongs to an album.
    Songs uploaded by artists can require approval before appearing publicly.
    """

    class ReleaseType(models.TextChoices):
        SINGLE = 'single', 'Single'
        ALBUM = 'album', 'Album'

    title = models.CharField(max_length=255)
    artist = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='songs',
    )
    album = models.ForeignKey(
        Album,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='songs',
    )

    duration = models.PositiveIntegerField(
        help_text='Duration in seconds.',
    )

    audio_file = models.FileField(
        upload_to='songs/audio/',
        null=True,
        blank=True,
    )
    cover = models.ImageField(
        upload_to='songs/covers/',
        null=True,
        blank=True,
    )

    lyrics = models.TextField(blank=True)
    streams = models.PositiveIntegerField(default=0)

    release_date = models.DateField(null=True, blank=True)
    approved = models.BooleanField(default=False)

    release_type = models.CharField(
        max_length=10,
        choices=ReleaseType.choices,
        default=ReleaseType.SINGLE,
    )
    genre = models.CharField(max_length=100, blank=True)
    release_year = models.PositiveIntegerField(null=True, blank=True)
    collaborators = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title