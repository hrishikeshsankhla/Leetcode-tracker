from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GroupViewSet, GroupInvitationViewSet, GroupChallengeViewSet

router = DefaultRouter()
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'invitations', GroupInvitationViewSet, basename='invitation')
router.register(r'challenges', GroupChallengeViewSet, basename='challenge')

urlpatterns = [
    path('', include(router.urls)),
]