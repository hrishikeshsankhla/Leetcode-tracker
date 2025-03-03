from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """
    Custom User model with additional fields
    """
    email = models.EmailField(_('email address'), unique=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    bio = models.TextField(blank=True)
    google_id = models.CharField(max_length=255, blank=True, null=True)
    leetcode_username = models.CharField(max_length=100, blank=True, null=True)
    
    # Fields for tracking LeetCode activity
    last_active_date = models.DateField(null=True, blank=True)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    total_problems_solved = models.IntegerField(default=0)
    easy_problems_solved = models.IntegerField(default=0)
    medium_problems_solved = models.IntegerField(default=0)
    hard_problems_solved = models.IntegerField(default=0)
    
    # Role field for differentiating between regular users and mentors
    ROLES = (
        ('student', 'Student'),
        ('mentor', 'Mentor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLES, default='student')
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    browser_notifications = models.BooleanField(default=True)
    
    # Subscription status
    is_premium = models.BooleanField(default=False)
    subscription_ends = models.DateTimeField(null=True, blank=True)
    
    # Required fields for AbstractUser
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

# Create your models here.
