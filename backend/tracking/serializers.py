from rest_framework import serializers

from music.serializers import SongSerializer
from .models import SongPlay


class SongPlaySerializer(serializers.ModelSerializer):
    """
    Serializer for song play history.
    Includes full song details so the frontend can display what was played.
    """
    song_details = SongSerializer(source='song', read_only=True)

    class Meta:
        model = SongPlay
        fields = [
            'id',
            'user',
            'song',
            'song_details',
            'playlist',
            'listened_seconds',
            'song_duration_seconds',
            'completed',
            'created_at',
        ]
        read_only_fields = ['user', 'created_at']