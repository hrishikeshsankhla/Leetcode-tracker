from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings





from .serializers import (
    UserSerializer, RegisterSerializer, 
    CustomTokenObtainPairSerializer, GoogleAuthSerializer,
    UserSerializer, UserProfileSerializer
)

User = get_user_model()

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that uses our custom serializer
    """
    serializer_class = CustomTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    """
    API view for user registration
    """
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    API view for retrieving and updating user details
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user

class GoogleLoginView(APIView):
    """
    API view for Google OAuth login
    """
    permission_classes = (permissions.AllowAny,)
    serializer_class = GoogleAuthSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token_id = serializer.validated_data['token_id']
        
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token_id, requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID)

            # Get user email from decoded token
            email = idinfo['email']
            
            # Check if user exists
            try:
                user = User.objects.get(email=email)
                
                # Update Google ID if not set
                if not user.google_id and 'sub' in idinfo:
                    user.google_id = idinfo['sub']
                    user.save()
                    
            except User.DoesNotExist:
                # Create a new user
                user = User.objects.create(
                    email=email,
                    username=email.split('@')[0],  # Use the part before @ as username
                    google_id=idinfo.get('sub', ''),
                    is_active=True,
                    profile_picture=idinfo.get('picture', '')  # Save the profile picture URL
                )
                
                # Set profile picture if available
                if 'picture' in idinfo:
                    # This would require additional handling to save the image from URL
                    pass
                
            # Generate tokens
            refresh = CustomTokenObtainPairSerializer.get_token(user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
            
        except ValueError:
            return Response(
                {'error': 'Invalid token'},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for user profiles
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Admins and mentors can see all users
        if user.role in ['admin', 'mentor']:
            return User.objects.all()
        
        # Regular users can only see their own profile
        return User.objects.filter(id=user.id)
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'me':
            return UserProfileSerializer
        return UserSerializer
    
    def get_permissions(self):
        """
        Override permissions for specific actions
        """
        if self.action in ['update', 'partial_update']:
            # Only allow users to update their own profiles
            permission_classes = [permissions.IsAuthenticated]
        elif self.action == 'destroy':
            # Only admins can delete users
            permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        user = request.user
        
        if request.method == 'GET':
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = UserSerializer(user, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)