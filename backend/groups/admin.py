from django.contrib import admin
from .models import Group, GroupMembership, GroupInvitation, GroupChallenge

class GroupMembershipInline(admin.TabularInline):
    model = GroupMembership
    extra = 1

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_by', 'created_at', 'is_private', 'max_members')
    list_filter = ('is_private', 'created_at')
    search_fields = ('name', 'description', 'created_by__username')
    inlines = [GroupMembershipInline]

@admin.register(GroupInvitation)
class GroupInvitationAdmin(admin.ModelAdmin):
    list_display = ('email', 'group', 'invited_by', 'created_at', 'accepted')
    list_filter = ('accepted', 'created_at')
    search_fields = ('email', 'group__name', 'invited_by__username')

@admin.register(GroupChallenge)
class GroupChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'group', 'start_date', 'end_date', 'created_by')
    list_filter = ('start_date', 'end_date')
    search_fields = ('title', 'description', 'group__name')
    filter_horizontal = ('problems',)
