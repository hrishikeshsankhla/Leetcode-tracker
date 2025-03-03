from rest_framework import serializers
from .models import DailyActivity, UserStats, Notification, DailyMotivation

class DailyActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyActivity
        fields = ('id', 'user', 'date', 'problems_solved', 'easy_solved', 
                  'medium_solved', 'hard_solved', 'total_submissions', 
                  'streak_maintained')
        read_only_fields = ('id',)

class UserStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStats
        fields = ('id', 'user', 'ranking_percentile', 'consistency_score', 
                  'problem_solving_score', 'code_quality_score', 'updated_at')
        read_only_fields = ('id', 'updated_at')

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'user', 'title', 'message', 'created_at', 'read', 
                  'notification_type', 'related_group', 'related_submission')
        read_only_fields = ('id', 'created_at')

class DailyMotivationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyMotivation
        fields = ('id', 'quote', 'author', 'date')
        read_only_fields = ('id',)