from rest_framework import serializers
from .models import Problem, DailyChallenge, ProblemExample

class ProblemExampleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProblemExample
        fields = ('id', 'input', 'output', 'explanation')

class ProblemSerializer(serializers.ModelSerializer):
    examples = ProblemExampleSerializer(many=True, read_only=True)
    
    class Meta:
        model = Problem
        fields = ('id', 'leetcode_id', 'title', 'slug', 'description', 
                  'difficulty', 'category', 'tags', 'success_rate', 
                  'is_premium', 'examples')

class DailyChallengeSerializer(serializers.ModelSerializer):
    problem = ProblemSerializer(read_only=True)
    
    class Meta:
        model = DailyChallenge
        fields = ('id', 'date', 'problem')