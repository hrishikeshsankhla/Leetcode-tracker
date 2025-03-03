from django.db import models

class Problem(models.Model):
    """
    Model for storing LeetCode problems
    """
    leetcode_id = models.IntegerField(unique=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    difficulty = models.CharField(
        max_length=10,
        choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')]
    )
    category = models.CharField(max_length=100)
    tags = models.JSONField(default=list)  # Store tags as a JSON array
    success_rate = models.FloatField(default=0)
    is_premium = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {self.difficulty}"

class DailyChallenge(models.Model):
    """
    Model for storing daily challenge problems
    """
    problem = models.ForeignKey(Problem, on_delete=models.CASCADE)
    date = models.DateField(unique=True)
    
    def __str__(self):
        return f"Daily Challenge - {self.date}: {self.problem.title}"

class ProblemExample(models.Model):
    """
    Model for storing problem examples/test cases
    """
    problem = models.ForeignKey(Problem, related_name='examples', on_delete=models.CASCADE)
    input = models.TextField()
    output = models.TextField()
    explanation = models.TextField(blank=True)
    
    def __str__(self):
        return f"Example for {self.problem.title}"
