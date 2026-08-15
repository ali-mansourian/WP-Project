from rest_framework import serializers

from music.models import Song
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

    def validate_song(self, value):
        """
        Only approved songs can be streamed publicly.
        """
        if not value.approved:
            raise serializers.ValidationError(
                'Only approved songs can be streamed.'
            )
        return value

    def validate(self, attrs):
        """
        A valid stream must be connected to a song and must represent
        at least 10 seconds of listening, unless the song was completed.
        """
        song = attrs.get('song')

        if not song:
            raise serializers.ValidationError({
                'song': 'song is required.'
            })

        listened_seconds = attrs.get('listened_seconds', 0)
        completed = attrs.get('completed', False)

        if not completed and listened_seconds < 10:
            raise serializers.ValidationError({
                'listened_seconds': (
                    'A stream is counted only after listening for at least 10 seconds.'
                )
            })

        return attrs