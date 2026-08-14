from rest_framework import serializers

from subscriptions.serializers import UserSubscriptionSerializer
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for payment records.
    Includes subscription details for context.
    """
    subscription = UserSubscriptionSerializer(read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    method_label = serializers.CharField(source='get_method_display', read_only=True)
    type_label = serializers.CharField(source='get_type_display', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id',
            'user',
            'subscription',
            'type',
            'type_label',
            'status',
            'status_label',
            'method',
            'method_label',
            'amount',
            'currency',
            'reference',
            'failure_reason',
            'refunded_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = fields