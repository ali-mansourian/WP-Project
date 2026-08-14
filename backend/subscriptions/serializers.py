from rest_framework import serializers

from accounts.serializers import UserSerializer
from .models import SubscriptionPlan, UserSubscription


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    """
    Serializer for subscription plans.
    Used to display available plans and pricing to users/admins.
    """
    tier_label = serializers.CharField(source='get_tier_display', read_only=True)
    duration_label = serializers.CharField(source='get_duration_months_display', read_only=True)

    class Meta:
        model = SubscriptionPlan
        fields = [
            'id',
            'tier',
            'tier_label',
            'duration_months',
            'duration_label',
            'price',
            'playlist_limit',
            'is_active',
            'created_at',
            'updated_at',
        ]


class UserSubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for user subscriptions.
    Includes plan details and user-friendly status information.
    """
    plan = SubscriptionPlanSerializer(read_only=True)
    plan_id = serializers.PrimaryKeyRelatedField(
        queryset=SubscriptionPlan.objects.all(),
        source='plan',
        write_only=True,
    )
    user = UserSerializer(read_only=True)
    is_currently_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserSubscription
        fields = [
            'id',
            'user',
            'plan',
            'plan_id',
            'status',
            'is_currently_active',
            'start_date',
            'end_date',
            'price_paid',
            'payment_reference',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'user',
            'status',
            'start_date',
            'end_date',
            'price_paid',
            'payment_reference',
        ]