from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from .models import Group, GroupMembership, GroupInvitation, GroupChallenge
from .serializers import (
    GroupSerializer, GroupMembershipSerializer, 
    GroupInvitationSerializer, GroupChallengeSerializer
)

class IsGroupAdmin(permissions.BasePermission):
    """
    Custom permission to only allow group admins to perform actions
    """
    def has_object_permission(self, request, view, obj):
        # Check if the user is an admin for this group
        if isinstance(obj, Group):
            return GroupMembership.objects.filter(
                user=request.user, group=obj, role='admin'
            ).exists()
        
        # For other models that have a group attribute
        if hasattr(obj, 'group'):
            return GroupMembership.objects.filter(
                user=request.user, group=obj.group, role='admin'
            ).exists()
        
        return False

class IsGroupMember(permissions.BasePermission):
    """
    Custom permission to only allow group members to perform actions
    """
    def has_object_permission(self, request, view, obj):
        # Check if the user is a member of this group
        if isinstance(obj, Group):
            return GroupMembership.objects.filter(
                user=request.user, group=obj
            ).exists()
        
        # For other models that have a group attribute
        if hasattr(obj, 'group'):
            return GroupMembership.objects.filter(
                user=request.user, group=obj.group
            ).exists()
        
        return False

class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint for groups
    """
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    
    def get_queryset(self):
        user = self.request.user
        return Group.objects.filter(members=user)
    
    def get_permissions(self):
        """
        Override to use different permissions for different actions
        """
        if self.action in ['update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsGroupAdmin]
        return super().get_permissions()
    
    @action(detail=False)
    def my_groups(self, request):
        groups = Group.objects.filter(members=request.user)
        serializer = self.get_serializer(groups, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join(self, request, pk=None):
        group = self.get_object()
        user = request.user
        
        # Check if the user is already a member
        if GroupMembership.objects.filter(user=user, group=group).exists():
            return Response({"detail": "You are already a member of this group."}, status=400)
        
        # Check if the group has reached max members
        if group.members.count() >= group.max_members:
            return Response({"detail": "This group has reached its maximum capacity."}, status=400)
        
        # Add user as a member
        GroupMembership.objects.create(user=user, group=group, role='member')
        
        return Response({"detail": "You have successfully joined the group."})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsGroupAdmin])
    def remove_member(self, request, pk=None):
        group = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({"detail": "User ID is required."}, status=400)
        
        # Don't allow removing the last admin
        admin_count = GroupMembership.objects.filter(group=group, role='admin').count()
        is_admin = GroupMembership.objects.filter(group=group, user_id=user_id, role='admin').exists()
        
        if admin_count <= 1 and is_admin:
            return Response({"detail": "Cannot remove the last admin of the group."}, status=400)
        
        # Remove the membership
        membership = get_object_or_404(GroupMembership, group=group, user_id=user_id)
        membership.delete()
        
        return Response({"detail": "Member removed successfully."})
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def join_by_code(self, request):
        invite_code = request.data.get('invite_code')
        
        if not invite_code:
            return Response({"detail": "Invite code is required."}, status=400)
        
        try:
            group = Group.objects.get(invite_code=invite_code)
        except Group.DoesNotExist:
            return Response({"detail": "Invalid invite code."}, status=404)
        
        user = request.user
        
        # Check if the user is already a member
        if GroupMembership.objects.filter(user=user, group=group).exists():
            return Response({"detail": "You are already a member of this group."}, status=400)
        
        # Check if the group has reached max members
        if group.members.count() >= group.max_members:
            return Response({"detail": "This group has reached its maximum capacity."}, status=400)
        
        # Add user as a member
        GroupMembership.objects.create(user=user, group=group, role='member')
        
        return Response({
            "detail": "You have successfully joined the group.",
            "group": GroupSerializer(group).data
        })
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsGroupMember])
    def members(self, request, pk=None):
        group = self.get_object()
        memberships = GroupMembership.objects.filter(group=group)
        serializer = GroupMembershipSerializer(memberships, many=True)
        return Response(serializer.data)

class GroupInvitationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for group invitations
    """
    serializer_class = GroupInvitationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return GroupInvitation.objects.filter(invited_by=self.request.user)
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Send invitation email
        invitation = serializer.instance
        group_name = invitation.group.name
        invite_url = f"{settings.FRONTEND_URL}/groups/join/{invitation.token}"
        
        send_mail(
            subject=f'Invitation to join the "{group_name}" group on LeetCode Tracker',
            message=f'''
            Hello,
            
            You have been invited by {request.user.username} to join the "{group_name}" group on LeetCode Tracker.
            
            To accept this invitation, please click on the following link: {invite_url}
            
            If you don't have an account, you'll be able to register.
            
            Best regards,
            LeetCode Tracker Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[invitation.email],
            fail_silently=False,
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def accept(self, request):
        token = request.data.get('token')
        
        if not token:
            return Response({"detail": "Token is required."}, status=400)
        
        try:
            invitation = GroupInvitation.objects.get(token=token, accepted=False)
        except GroupInvitation.DoesNotExist:
            return Response({"detail": "Invalid or expired invitation."}, status=404)
        
        # Mark the invitation as accepted
        invitation.accepted = True
        invitation.save()
        
        if not request.user.is_authenticated:
            # Return group details for unauthenticated users
            return Response({
                "detail": "Invitation accepted. Please login or register to join the group.",
                "group": GroupSerializer(invitation.group).data,
                "email": invitation.email
            })
        
        # Add the user to the group if authenticated
        user = request.user
        
        # Check if the user's email matches the invitation email
        if user.email.lower() != invitation.email.lower():
            return Response({
                "detail": "This invitation was sent to a different email address."
            }, status=400)
        
        # Check if the user is already a member
        if GroupMembership.objects.filter(user=user, group=invitation.group).exists():
            return Response({
                "detail": "You are already a member of this group.",
                "group": GroupSerializer(invitation.group).data
            }, status=400)
        
        # Add user as a member
        GroupMembership.objects.create(
            user=user, 
            group=invitation.group, 
            role='member'
        )
        
        return Response({
            "detail": "You have successfully joined the group.",
            "group": GroupSerializer(invitation.group).data
        })

class GroupChallengeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for group challenges
    """
    serializer_class = GroupChallengeSerializer
    permission_classes = [permissions.IsAuthenticated, IsGroupMember]
    
    def get_queryset(self):
        user = self.request.user
        # Get all challenges for groups the user is a member of
        return GroupChallenge.objects.filter(group__members=user)
    
    def get_permissions(self):
        """
        Override to use different permissions for different actions
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated, IsGroupAdmin]
        return super().get_permissions()
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsGroupMember])
    def participants(self, request, pk=None):
        challenge = self.get_object()
        # Get all users who have attempted any of the challenge problems
        participants = User.objects.filter(
            submissions__problem__in=challenge.problems.all(),
            submissions__submission_time__gte=challenge.start_date,
            submissions__submission_time__lte=challenge.end_date,
            groups=challenge.group
        ).distinct()
        
        serializer = UserSerializer(participants, many=True)
        return Response(serializer.data)
