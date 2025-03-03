from rest_framework import serializers
from .models import Group, GroupMembership, GroupInvitation, GroupChallenge
from users.serializers import UserSerializer

class GroupMembershipSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = GroupMembership
        fields = ('id', 'user', 'user_details', 'group', 'role', 'joined_at')
        read_only_fields = ('id', 'joined_at')

class GroupSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = ('id', 'name', 'description', 'created_at', 'created_by', 
                  'created_by_details', 'invite_code', 'is_private', 
                  'max_members', 'member_count')
        read_only_fields = ('id', 'created_at', 'invite_code')
    
    def get_member_count(self, obj):
        return obj.members.count()
    
    def create(self, validated_data):
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        group = super().create(validated_data)
        
        # Add the creator as an admin member
        GroupMembership.objects.create(
            user=self.context['request'].user,
            group=group,
            role='admin'
        )
        
        return group

class GroupInvitationSerializer(serializers.ModelSerializer):
    invited_by_details = UserSerializer(source='invited_by', read_only=True)
    group_details = GroupSerializer(source='group', read_only=True)
    
    class Meta:
        model = GroupInvitation
        fields = ('id', 'group', 'group_details', 'email', 'invited_by', 
                  'invited_by_details', 'created_at', 'accepted', 'token')
        read_only_fields = ('id', 'created_at', 'token')
    
    def create(self, validated_data):
        # Set the invited_by field to the current user
        validated_data['invited_by'] = self.context['request'].user
        return super().create(validated_data)

class GroupChallengeSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = GroupChallenge
        fields = ('id', 'group', 'title', 'description', 'start_date', 
                  'end_date', 'created_by', 'created_by_details', 
                  'created_at', 'problems')
        read_only_fields = ('id', 'created_at')
    
    def create(self, validated_data):
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)