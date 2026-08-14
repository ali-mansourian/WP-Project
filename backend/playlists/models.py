from django.conf import settings
from django.db import models


class Playlist(models.Model):
    """
    Playlist model.

    A playlist belongs to one user and can be public or private.
    Subscription tiers will later control how many playlists a listener can create.
    """

    class Visibility(models.TextChoices):
        PUBLIC = 'public', 'Public'
        PRIVATE = 'private', 'Private'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='playlists',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    cover = models.ImageField(
        upload_to='playlist_covers/',
        null=True,
        blank=True,
    )
    visibility = models.CharField(
        max_length=10,
        choices=Visibility.choices,
        default=Visibility.PRIVATE,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class PlaylistTrack(models.Model):
    """
    Through model connecting songs to playlists.

    This allows ordering and prevents duplicate songs in the same playlist.
    """
    playlist = models.ForeignKey(
        Playlist,
        on_delete=models.CASCADE,
        related_name='tracks',
    )
    song = models.ForeignKey(
        'music.Song',
        on_delete=models.CASCADE,
        related_name='playlist_tracks',
    )
    position = models.PositiveIntegerField(default=0)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position', 'added_at']
        constraints = [
            models.UniqueConstraint(
                fields=['playlist', 'song'],
                name='unique_song_per_playlist',
            ),
        ]

    def __str__(self):
        return f"{self.playlist.title} - {self.song.title}"