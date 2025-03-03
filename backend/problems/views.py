from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Problem, DailyChallenge
from .serializers import ProblemSerializer, DailyChallengeSerializer

class ProblemViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for problems
    """
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category', 'tags']
    ordering_fields = ['leetcode_id', 'difficulty', 'success_rate', 'created_at']
    
    @action(detail=False)
    def easy(self, request):
        easy_problems = Problem.objects.filter(difficulty='easy')
        page = self.paginate_queryset(easy_problems)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(easy_problems, many=True)
        return Response(serializer.data)
    
    @action(detail=False)
    def medium(self, request):
        medium_problems = Problem.objects.filter(difficulty='medium')
        page = self.paginate_queryset(medium_problems)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(medium_problems, many=True)
        return Response(serializer.data)
    
    @action(detail=False)
    def hard(self, request):
        hard_problems = Problem.objects.filter(difficulty='hard')
        page = self.paginate_queryset(hard_problems)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(hard_problems, many=True)
        return Response(serializer.data)
    
    @action(detail=False)
    def random(self, request):
        # Get optional difficulty parameter
        difficulty = request.query_params.get('difficulty', None)
        
        # Filter by difficulty if provided
        if difficulty:
            random_problem = Problem.objects.filter(difficulty=difficulty).order_by('?').first()
        else:
            random_problem = Problem.objects.order_by('?').first()
        
        if random_problem:
            serializer = self.get_serializer(random_problem)
            return Response(serializer.data)
        return Response({"detail": "No problems found."}, status=404)

class DailyChallengeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for daily challenges
    """
    queryset = DailyChallenge.objects.all()
    serializer_class = DailyChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False)
    def today(self, request):
        today = timezone.localdate()
        try:
            challenge = DailyChallenge.objects.get(date=today)
            serializer = self.get_serializer(challenge)
            return Response(serializer.data)
        except DailyChallenge.DoesNotExist:
            return Response({"detail": "Today's challenge not found."}, status=404)

# Create your views here.
