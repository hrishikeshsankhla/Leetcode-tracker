from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProblemViewSet, DailyChallengeViewSet

router = DefaultRouter()
router.register(r'problems', ProblemViewSet)
router.register(r'daily-challenges', DailyChallengeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]