from rest_framework import serializers

from .models import Album, Song


class SongSerializer(serializers.ModelSerializer):
    """
    Serializer for songs.
    Handles automatic album creation/lookup based on the album_name string.
    """
    artist_name = serializers.CharField(source='artist.display_name', read_only=True)
    # We make album_name writable so the frontend can send it as a string
    album_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = Song
        fields = [
            'id', 'title', 'artist', 'artist_name', 'album', 'album_name',
            'duration', 'audio_file', 'cover', 'lyrics', 'streams',
            'release_date', 'approved', 'release_type', 'genre',
            'release_year', 'collaborators', 'created_at', 'updated_at',
        ]
        # We lock down system fields so artists cannot manually override them via the API
        read_only_fields = ['artist', 'streams', 'created_at', 'updated_at', 'approved']

    def create(self, validated_data):
        album_name = validated_data.pop('album_name', None)
        
        # Bulletproofing: safely remove any manual attempts to set these fields
        validated_data.pop('approved', None)
        validated_data.pop('artist', None)
        validated_data.pop('album', None)
        
        user = self.context['request'].user
        
        album = None
        if album_name:
            # Automatically find or create the album for this artist
            album, _ = Album.objects.get_or_create(
                title=album_name,
                artist=user,
            )
            
        # Songs are approved by default for now so you can see them immediately
        return Song.objects.create(artist=user, album=album, approved=True, **validated_data)

    def update(self, instance, validated_data):
        album_name = validated_data.pop('album_name', None)
        
        # Bulletproofing: prevent overriding system fields during edits
        validated_data.pop('approved', None)
        validated_data.pop('artist', None)
        validated_data.pop('album', None)
        
        if album_name is not None:
            if album_name == '':
                instance.album = None
            else:
                album, _ = Album.objects.get_or_create(
                    title=album_name,
                    artist=instance.artist,
                )
                instance.album = album
                
        return super().update(instance, validated_data)


class AlbumSerializer(serializers.ModelSerializer):
    """
    Serializer for albums.
    """
    artist_name = serializers.CharField(source='artist.display_name', read_only=True)
    songs = SongSerializer(many=True, read_only=True)

    class Meta:
        model = Album
        fields = [
            'id', 'title', 'artist', 'artist_name', 'cover',
            'release_date', 'songs', 'created_at', 'updated_at',
        ]