from django.db import models
from django.conf import settings

class DailyActivity(models.Model):
    """
    Model for storing user's daily LeetCode activity
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    problems_solved = models.IntegerField(default=0)
    easy_solved = models.IntegerField(default=0)
    medium_solved = models.IntegerField(default=0)
    hard_solved = models.IntegerField(default=0)
    total_submissions = models.IntegerField(default=0)
    streak_maintained = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ('user', 'date')
    
    def __str__(self):
        return f"{self.user.username} - {self.date} - {self.problems_solved} problems"

class UserStats(models.Model):
    """
    Model for storing aggregated user statistics
    """
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='stats')
    ranking_percentile = models.FloatField(default=0)  # 0-100
    consistency_score = models.FloatField(default=0)  # 0-100
    problem_solving_score = models.FloatField(default=0)  # 0-100
    code_quality_score = models.FloatField(default=0)  # 0-100
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Stats for {self.user.username}"

class Notification(models.Model):
    """
    Model for storing user notifications
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)
    
    TYPE_CHOICES = (
        ('streak', 'Streak Reminder'),
        ('achievement', 'Achievement'),
        ('group', 'Group Activity'),
        ('feedback', 'Feedback Received'),
        ('system', 'System Message'),
    )
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    
    # Optional link to related objects
    related_group = models.ForeignKey('groups.Group', null=True, blank=True, on_delete=models.SET_NULL)
    related_submission = models.ForeignKey('submissions.Submission', null=True, blank=True, on_delete=models.SET_NULL)
    
    def __str__(self):
        return f"{self.notification_type} - {self.user.username} - {self.title}"

class DailyMotivation(models.Model):
    """
    Model for storing daily motivational quotes
    """
    quote = models.TextField()
    author = models.CharField(max_length=255, blank=True)
    date = models.DateField(unique=True)
    
    def __str__(self):
        return f"{self.date} - {self.author}: {self.quote[:50]}..."