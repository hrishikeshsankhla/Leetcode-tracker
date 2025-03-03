from django.shortcuts import render

from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Sum, Avg
from datetime import timedelta
from .models import DailyActivity, UserStats, Notification, DailyMotivation
from .serializers import (
    DailyActivitySerializer, UserStatsSerializer, 
    NotificationSerializer, DailyMotivationSerializer
)

class DailyActivityViewSet(viewsets.ModelViewSet):
    """
    API endpoint for tracking daily activity
    """
    serializer_class = DailyActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return DailyActivity.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False)
    def today(self, request):
        today = timezone.localdate()
        try:
            activity = DailyActivity.objects.get(user=request.user, date=today)
            serializer = self.get_serializer(activity)
            return Response(serializer.data)
        except DailyActivity.DoesNotExist:
            return Response({
                "user": request.user.id,
                "date": today,
                "problems_solved": 0,
                "easy_solved": 0,
                "medium_solved": 0,
                "hard_solved": 0,
                "total_submissions": 0,
                "streak_maintained": False
            })
    
    @action(detail=False)
    def streak(self, request):
        # Get user's current streak
        user = request.user
        today = timezone.localdate()
        yesterday = today - timedelta(days=1)
        
        # Check if user has activity for today
        today_activity = DailyActivity.objects.filter(
            user=user, 
            date=today,
            problems_solved__gt=0
        ).exists()
        
        # Get the latest streak of consecutive days
        streak = 0
        check_date = yesterday
        
        # Count backwards from yesterday until we find a day with no activity
        while DailyActivity.objects.filter(
            user=user, 
            date=check_date,
            problems_solved__gt=0
        ).exists():
            streak += 1
            check_date = check_date - timedelta(days=1)
        
        # If user has activity today, add today to the streak
        if today_activity:
            streak += 1
        
        return Response({"streak": streak, "has_activity_today": today_activity})

class UserStatsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for user statistics
    """
    serializer_class = UserStatsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserStats.objects.filter(user=self.request.user)
    
    @action(detail=False)
    def summary(self, request):
        user = request.user
        today = timezone.localdate()
        start_of_week = today - timedelta(days=today.weekday())
        start_of_month = today.replace(day=1)
        
        # Get daily activities
        day_stats = DailyActivity.objects.filter(user=user)
        
        # Weekly stats
        week_stats = day_stats.filter(date__gte=start_of_week).aggregate(
            problems=Sum('problems_solved', default=0),
            easy=Sum('easy_solved', default=0),
            medium=Sum('medium_solved', default=0),
            hard=Sum('hard_solved', default=0),
            days=Count('id')
        )
        
        # Monthly stats
        month_stats = day_stats.filter(date__gte=start_of_month).aggregate(
            problems=Sum('problems_solved', default=0),
            easy=Sum('easy_solved', default=0),
            medium=Sum('medium_solved', default=0),
            hard=Sum('hard_solved', default=0),
            days=Count('id')
        )
        
        # All-time stats
        all_time_stats = day_stats.aggregate(
            problems=Sum('problems_solved', default=0),
            easy=Sum('easy_solved', default=0),
            medium=Sum('medium_solved', default=0),
            hard=Sum('hard_solved', default=0),
            days=Count('id')
        )
        
        # Get user ranking data from UserStats
        try:
            user_stats = UserStats.objects.get(user=user)
            ranking_data = {
                "ranking_percentile": user_stats.ranking_percentile,
                "consistency_score": user_stats.consistency_score,
                "problem_solving_score": user_stats.problem_solving_score,
                "code_quality_score": user_stats.code_quality_score
            }
        except UserStats.DoesNotExist:
            ranking_data = {
                "ranking_percentile": 0,
                "consistency_score": 0,
                "problem_solving_score": 0,
                "code_quality_score": 0
            }
        
        return Response({
            "weekly": week_stats,
            "monthly": month_stats,
            "all_time": all_time_stats,
            "ranking": ranking_data
        })

class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for user notifications
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({"detail": "All notifications marked as read."})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({"detail": "Notification marked as read."})

class DailyMotivationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for daily motivation quotes
    """
    queryset = DailyMotivation.objects.all()
    serializer_class = DailyMotivationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False)
    def today(self, request):
        today = timezone.localdate()
        try:
            motivation = DailyMotivation.objects.get(date=today)
            serializer = self.get_serializer(motivation)
            return Response(serializer.data)
        except DailyMotivation.DoesNotExist:
            # Get a random quote if there's no specific one for today
            random_quote = DailyMotivation.objects.order_by('?').first()
            if random_quote:
                serializer = self.get_serializer(random_quote)
                return Response(serializer.data)
            return Response({"detail": "No motivation quotes found."}, status=404)