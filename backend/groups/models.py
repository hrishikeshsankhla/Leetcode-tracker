from django.db import models
from django.conf import settings
import uuid

class Group(models.Model):
    """
    Model for storing study groups
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='created_groups'
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='leetcode_groups'
    )
    invite_code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    is_private = models.BooleanField(default=True)
    max_members = models.IntegerField(default=50)
    
    def __str__(self):
        return self.name

class GroupMembership(models.Model):
    """
    Model for storing group membership details
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('member', 'Member'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    
    class Meta:
        unique_together = ('user', 'group')
    
    def __str__(self):
        return f"{self.user.username} - {self.group.name} - {self.role}"

class GroupInvitation(models.Model):
    """
    Model for storing group invitations
    """
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    email = models.EmailField()
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='sent_invitations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    accepted = models.BooleanField(default=False)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    def __str__(self):
        return f"Invitation to {self.group.name} for {self.email}"

class GroupChallenge(models.Model):
    """
    Model for storing group-specific challenges
    """
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='challenges')
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    problems = models.ManyToManyField('problems.Problem', related_name='group_challenges')
    
    def __str__(self):
        return f"{self.title} - {self.group.name}"
