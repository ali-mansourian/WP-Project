from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import SupportReply, SupportTicket


class SupportReplySerializer(serializers.ModelSerializer):
    """
    Serializer for support ticket replies.
    Includes author details for display purposes.
    """
    author = UserSerializer(read_only=True)

    class Meta:
        model = SupportReply
        fields = [
            'id',
            'ticket',
            'author',
            'message',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['ticket', 'author', 'created_at', 'updated_at']


class SupportTicketListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing support tickets.
    Does not include replies to keep list responses small.
    """
    user = UserSerializer(read_only=True)
    category_label = serializers.CharField(source='get_category_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = SupportTicket
        fields = [
            'id',
            'user',
            'assigned_to',
            'category',
            'category_label',
            'status',
            'status_label',
            'subject',
            'message',
            'attachment',
            'reply_count',
            'resolved_at',
            'created_at',
            'updated_at',
        ]

    def get_reply_count(self, obj):
        return obj.replies.count()


class SupportTicketDetailSerializer(serializers.ModelSerializer):
    """
    Full serializer for a single support ticket.
    Includes all replies and user details.
    """
    user = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    category_label = serializers.CharField(source='get_category_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    replies = SupportReplySerializer(many=True, read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = SupportTicket
        fields = [
            'id',
            'user',
            'assigned_to',
            'category',
            'category_label',
            'status',
            'status_label',
            'subject',
            'message',
            'attachment',
            'replies',
            'reply_count',
            'resolved_at',
            'created_at',
            'updated_at',
        ]

    def get_reply_count(self, obj):
        return obj.replies.count()