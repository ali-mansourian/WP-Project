from rest_framework import serializers

from music.serializers import SongSerializer
from .models import Playlist, PlaylistTrack


class PlaylistTrackSerializer(serializers.ModelSerializer):
    """
    Serializer for playlist tracks.
    Includes full song details for easier frontend consumption.
    """
    song = SongSerializer(read_only=True)

    class Meta:
        model = PlaylistTrack
        fields = [
            'id',
            'song',
            'position',
            'added_at',
        ]


class PlaylistListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing playlists.
    Does not include tracks to keep list responses small.
    """
    owner_name = serializers.CharField(source='owner.display_name', read_only=True)
    song_count = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = [
            'id',
            'title',
            'description',
            'cover',
            'visibility',
            'owner',
            'owner_name',
            'song_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def get_song_count(self, obj):
        return obj.tracks.count()


class PlaylistDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for a single playlist.
    Includes all tracks with song details.
    """
    owner_name = serializers.CharField(source='owner.display_name', read_only=True)
    tracks = PlaylistTrackSerializer(many=True, read_only=True)
    song_count = serializers.SerializerMethodField()

    class Meta:
        model = Playlist
        fields = [
            'id',
            'title',
            'description',
            'cover',
            'visibility',
            'owner',
            'owner_name',
            'tracks',
            'song_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def get_song_count(self, obj):
        return obj.tracks.count()