from django.conf import settings
from django.db import models


class SongPlay(models.Model):
    """
    Records a song playback event for a user.

    This supports:
    - listening history
    - recently played songs
    - play count analytics
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='song_plays',
    )

    song = models.ForeignKey(
        'music.Song',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='plays',
    )

    playlist = models.ForeignKey(
        'playlists.Playlist',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='plays',
    )

    listened_seconds = models.PositiveIntegerField(
        default=0,
        help_text='How many seconds the user listened to during this play event.',
    )

    song_duration_seconds = models.PositiveIntegerField(
        default=0,
        help_text='Duration of the song at the time of playback.',
    )

    completed = models.BooleanField(
        default=False,
        help_text='True if the user listened to most or all of the song.',
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['song', '-created_at']),
        ]

    def __str__(self):
        song_title = self.song.title if self.song else 'Deleted Song'
        return f'{self.user.email} played {song_title}'