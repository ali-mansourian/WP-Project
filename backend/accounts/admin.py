from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import User


class CustomUserCreationForm(UserCreationForm):
    """
    Proper admin form for creating users.
    Ensures passwords are hashed correctly.
    """

    class Meta(UserCreationForm.Meta):
        model = User
        fields = (
            'email',
            'name',
            'role',
            'tier',
            'status',
        )


class CustomUserChangeForm(UserChangeForm):
    """
    Proper admin form for editing users.
    """

    class Meta(UserChangeForm.Meta):
        model = User
        fields = (
            'email',
            'name',
            'stage_name',
            'role',
            'tier',
            'status',
            'avatar',
            'bio',
            'date_of_birth',
            'gender',
            'rejection_reason',
            'is_active',
            'is_staff',
            'is_superuser',
            'groups',
            'user_permissions',
        )


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    model = User

    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

    list_display = (
        'email',
        'name',
        'role',
        'tier',
        'status',
        'is_active',
    )
    list_filter = (
        'role',
        'tier',
        'status',
        'is_active',
        'is_staff',
        'is_superuser',
    )
    search_fields = (
        'email',
        'name',
        'stage_name',
    )
    ordering = ('-joined_date',)
    readonly_fields = (
        'joined_date',
        'last_login',
    )

    fieldsets = (
        (
            None,
            {
                'fields': (
                    'email',
                    'password',
                ),
            },
        ),
        (
            'Profile',
            {
                'fields': (
                    'name',
                    'stage_name',
                    'avatar',
                    'bio',
                    'date_of_birth',
                    'gender',
                ),
            },
        ),
        (
            'Platform',
            {
                'fields': (
                    'role',
                    'tier',
                    'status',
                    'rejection_reason',
                ),
            },
        ),
        (
            'Permissions',
            {
                'fields': (
                    'is_active',
                    'is_staff',
                    'is_superuser',
                    'groups',
                    'user_permissions',
                ),
            },
        ),
        (
            'Important Dates',
            {
                'fields': (
                    'last_login',
                    'joined_date',
                ),
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': (
                    'email',
                    'name',
                    'role',
                    'tier',
                    'status',
                    'password1',
                    'password2',
                ),
            },
        ),
    )