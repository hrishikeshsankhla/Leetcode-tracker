from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubmissionViewSet, FeedbackViewSet

router = DefaultRouter()
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'feedback', FeedbackViewSet, basename='feedback')

urlpatterns = [
    path('', include(router.urls)),
]