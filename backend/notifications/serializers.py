from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for user notifications.
    """
    type_label = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'type',
            'type_label',
            'title',
            'message',
            'link',
            'read',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'type',
            'title',
            'message',
            'link',
            'created_at',
        ]