from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role

        return token 

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'leetcode_username', 'profile_picture', 'bio', 
                  'current_streak', 'longest_streak', 'total_problems_solved',
                  'easy_problems_solved', 'medium_problems_solved', 
                  'hard_problems_solved', 'role', 'is_premium')
        read_only_fields = ('id', 'current_streak', 'longest_streak', 
                            'total_problems_solved', 'easy_problems_solved', 
                            'medium_problems_solved', 'hard_problems_solved', 
                            'is_premium')

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for registering a new user
    """
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    leetcode_username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'role', 'leetcode_username')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            role=validated_data.get('role', 'student'),
            leetcode_username=validated_data.get('leetcode_username', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class GoogleAuthSerializer(serializers.Serializer):
    """
    Serializer for Google OAuth authentication
    """
    token_id = serializers.CharField(required=True)

class UserProfileSerializer(serializers.ModelSerializer):
    total_problems_solved = serializers.SerializerMethodField()
    days_active = serializers.SerializerMethodField()
    current_streak = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 
                  'leetcode_username', 'role', 'bio', 'profile_picture', 'date_joined', 
                  'total_problems_solved', 'days_active', 'current_streak')
        read_only_fields = ('id', 'date_joined', 'role')
    
    def get_total_problems_solved(self, obj):
        from problems.models import Problem
        return Problem.objects.filter(submissions__user=obj, submissions__status='accepted').distinct().count()
    
    def get_days_active(self, obj):
        from analytics.models import DailyActivity
        return DailyActivity.objects.filter(user=obj, problems_solved__gt=0).count()
    
    def get_current_streak(self, obj):
        from analytics.models import DailyActivity
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.localdate()
        yesterday = today - timedelta(days=1)
        
        # Check if user has activity for today
        today_activity = DailyActivity.objects.filter(
            user=obj, 
            date=today,
            problems_solved__gt=0
        ).exists()
        
        # Get the latest streak of consecutive days
        streak = 0
        check_date = yesterday
        
        # Count backwards from yesterday until we find a day with no activity
        while DailyActivity.objects.filter(
            user=obj, 
            date=check_date,
            problems_solved__gt=0
        ).exists():
            streak += 1
            check_date = check_date - timedelta(days=1)
        
        # If user has activity today, add today to the streak
        if today_activity:
            streak += 1
        
        return streak
