from django.contrib import admin
from .models import DailyActivity, UserStats, Notification, DailyMotivation

@admin.register(DailyActivity)
class DailyActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'problems_solved', 'streak_maintained')
    list_filter = ('date', 'streak_maintained')
    search_fields = ('user__username',)
    date_hierarchy = 'date'

@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display = ('user', 'ranking_percentile', 'consistency_score', 'problem_solving_score', 'code_quality_score')
    search_fields = ('user__username',)

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'title', 'read', 'created_at')
    list_filter = ('notification_type', 'read', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    date_hierarchy = 'created_at'

@admin.register(DailyMotivation)
class DailyMotivationAdmin(admin.ModelAdmin):
    list_display = ('date', 'author', 'quote')
    date_hierarchy = 'date'
    search_fields = ('quote', 'author')
