from rest_framework import serializers

from .models import ArtistSettlement


class ArtistSettlementSerializer(serializers.ModelSerializer):
    """
    Serializer for artist financial settlements.
    Displays stream counts, unique listeners, and payout amounts.
    """
    artist_name = serializers.CharField(source='artist.display_name', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = ArtistSettlement
        fields = [
            'id',
            'artist',
            'artist_name',
            'period',
            'total_streams',
            'unique_listeners',
            'amount_due',
            'status',
            'status_label',
            'created_at',
            'settled_at',
        ]
        read_only_fields = [
            'id', 'artist', 'artist_name', 'period', 'total_streams', 
            'unique_listeners', 'amount_due', 'created_at', 'settled_at'
        ]