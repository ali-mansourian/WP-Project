from rest_framework import serializers

from .models import Album, Song


class SongSerializer(serializers.ModelSerializer):
    """
    Serializer for songs.
    Includes artist and album names for easier frontend consumption.
    """
    artist_name = serializers.CharField(source='artist.display_name', read_only=True)
    album_name = serializers.CharField(source='album.title', read_only=True, default=None)

    class Meta:
        model = Song
        fields = [
            'id',
            'title',
            'artist',
            'artist_name',
            'album',
            'album_name',
            'duration',
            'audio_file',
            'cover',
            'lyrics',
            'streams',
            'release_date',
            'approved',
            'release_type',
            'genre',
            'release_year',
            'collaborators',
            'created_at',
            'updated_at',
        ]


class AlbumSerializer(serializers.ModelSerializer):
    """
    Serializer for albums.
    Includes nested songs and the artist's display name.
    """
    artist_name = serializers.CharField(source='artist.display_name', read_only=True)
    songs = SongSerializer(many=True, read_only=True)

    class Meta:
        model = Album
        fields = [
            'id',
            'title',
            'artist',
            'artist_name',
            'cover',
            'release_date',
            'songs',
            'created_at',
            'updated_at',
        ]