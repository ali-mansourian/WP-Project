from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'role', 'tier', 'status')
    list_filter = ('role', 'tier', 'status')
    search_fields = ('email', 'name')
    ordering = ('-joined_date',)