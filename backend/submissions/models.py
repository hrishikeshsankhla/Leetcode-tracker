from django.db import models

from django.db import models
from django.conf import settings
from problems.models import Problem

class Submission(models.Model):
    """
    Model for storing user submissions
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    code = models.TextField()
    language = models.CharField(max_length=50)
    submission_time = models.DateTimeField(auto_now_add=True)
    
    STATUS_CHOICES = (
        ('accepted', 'Accepted'),
        ('wrong_answer', 'Wrong Answer'),
        ('time_limit_exceeded', 'Time Limit Exceeded'),
        ('runtime_error', 'Runtime Error'),
        ('memory_limit_exceeded', 'Memory Limit Exceeded'),
        ('compilation_error', 'Compilation Error'),
        ('pending', 'Pending'),
    )
    status = models.CharField(max_length=30, choices=STATUS_CHOICES)
    
    runtime = models.FloatField(null=True, blank=True)  # in milliseconds
    memory_usage = models.FloatField(null=True, blank=True)  # in MB
    
    def __str__(self):
        return f"{self.user.username} - {self.problem.title} - {self.status}"

class Feedback(models.Model):
    """
    Model for storing mentor feedback on submissions
    """
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='feedbacks')
    mentor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='given_feedbacks')
    comment = models.TextField()
    time_complexity_rating = models.IntegerField(null=True, blank=True)  # 1-5 scale
    space_complexity_rating = models.IntegerField(null=True, blank=True)  # 1-5 scale
    code_quality_rating = models.IntegerField(null=True, blank=True)  # 1-5 scale
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Feedback by {self.mentor.username} on {self.submission.user.username}'s submission"
