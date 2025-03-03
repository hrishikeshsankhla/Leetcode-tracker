from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DailyActivityViewSet, UserStatsViewSet, 
    NotificationViewSet, DailyMotivationViewSet
)

router = DefaultRouter()
router.register(r'daily-activity', DailyActivityViewSet, basename='daily-activity')
router.register(r'user-stats', UserStatsViewSet, basename='user-stats')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'motivation', DailyMotivationViewSet, basename='motivation')

urlpatterns = [
    path('', include(router.urls)),
]