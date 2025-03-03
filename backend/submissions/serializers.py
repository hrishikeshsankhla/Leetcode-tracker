from rest_framework import serializers
from .models import Submission, Feedback
from users.serializers import UserSerializer
from problems.serializers import ProblemSerializer

class SubmissionSerializer(serializers.ModelSerializer):
    problem_details = ProblemSerializer(source='problem', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Submission
        fields = ('id', 'user', 'user_details', 'problem', 'problem_details', 
                  'code', 'language', 'submission_time', 'status', 
                  'runtime', 'memory_usage')
        read_only_fields = ('id', 'user', 'user_details', 'submission_time')
    
    def create(self, validated_data):
        # Set the user from the request
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class FeedbackSerializer(serializers.ModelSerializer):
    mentor_details = UserSerializer(source='mentor', read_only=True)
    
    class Meta:
        model = Feedback
        fields = ('id', 'submission', 'mentor', 'mentor_details', 'comment',
                  'time_complexity_rating', 'space_complexity_rating',
                  'code_quality_rating', 'created_at', 'updated_at')
        read_only_fields = ('id', 'mentor', 'mentor_details', 'created_at', 'updated_at')
    
    def create(self, validated_data):
        # Set the mentor from the request
        validated_data['mentor'] = self.context['request'].user
        return super().create(validated_data)