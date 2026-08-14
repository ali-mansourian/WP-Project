from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for returning user profile data to the frontend.
    """
    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'role', 'tier', 'avatar', 'bio',
            'date_of_birth', 'gender', 'preferences', 'status', 'rejection_reason',
            'stage_name', 'is_verified_artist', 'joined_date'
        ]
        read_only_fields = ['id', 'joined_date', 'status', 'rejection_reason']


class RegisterListenerSerializer(serializers.ModelSerializer):
    """
    Serializer for listener registration.
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'date_of_birth', 'gender']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            date_of_birth=validated_data.get('date_of_birth'),
            gender=validated_data.get('gender', ''),
            role='listener',
            tier='free',
            status='active'
        )
        return user


class RegisterArtistSerializer(serializers.ModelSerializer):
    """
    Serializer for artist registration.
    Sets status to 'pending' so admins must approve them.
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'stage_name', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['stage_name'],
            stage_name=validated_data['stage_name'],
            password=validated_data['password'],
            role='artist',
            tier='free',
            status='pending'
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login. Validates email and password.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        data['user'] = user
        return data