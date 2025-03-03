from django.shortcuts import render
from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Submission, Feedback
from .serializers import SubmissionSerializer, FeedbackSerializer

class IsOwnerOrMentor(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or mentors to view it
    """
    def has_object_permission(self, request, view, obj):
        # Check if the user is the owner
        if obj.user == request.user:
            return True
        
        # Check if the user is a mentor
        if request.user.role in ['mentor', 'admin']:
            return True
        
        return False

class SubmissionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for submissions
    """
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrMentor]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['submission_time', 'status', 'runtime', 'memory_usage']
    
    def get_queryset(self):
        user = self.request.user
        
        # Mentors and admins can see all submissions
        if user.role in ['mentor', 'admin']:
            return Submission.objects.all()
        
        # Regular users can only see their own submissions
        return Submission.objects.filter(user=user)
    
    @action(detail=False)
    def my_submissions(self, request):
        submissions = Submission.objects.filter(user=request.user)
        page = self.paginate_queryset(submissions)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(submissions, many=True)
        return Response(serializer.data)
    
    @action(detail=False)
    def by_problem(self, request):
        problem_id = request.query_params.get('problem_id', None)
        if problem_id is None:
            return Response({"detail": "Problem ID is required."}, status=400)
        
        user = request.user
        if user.role in ['mentor', 'admin']:
            submissions = Submission.objects.filter(problem_id=problem_id)
        else:
            submissions = Submission.objects.filter(problem_id=problem_id, user=user)
        
        page = self.paginate_queryset(submissions)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(submissions, many=True)
        return Response(serializer.data)

class FeedbackViewSet(viewsets.ModelViewSet):
    """
    API endpoint for feedback
    """
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Mentors can see the feedback they've given
        if user.role in ['mentor', 'admin']:
            return Feedback.objects.filter(mentor=user)
        
        # Regular users can see feedback on their submissions
        return Feedback.objects.filter(submission__user=user)

# Create your views here.
