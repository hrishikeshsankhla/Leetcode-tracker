from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

schema_view = get_schema_view(
    openapi.Info(
        title="LeetCode Tracker API",
        default_version='v1',
        description="API for tracking LeetCode progress",
        terms_of_service="https://www.github.com/yourusername/leetcodetracker",
        contact=openapi.Contact(email="your.email@example.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# View to set CSRF cookie
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication URLs
    path('accounts/', include('allauth.urls')),
    path('accounts/', include('allauth.socialaccount.urls')),
    
    # API endpoints
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('api/', include('problems.urls')),
    path('api/', include('submissions.urls')),
    path('api/', include('groups.urls')),
    path('api/', include('analytics.urls')),
    path('api/', include('users.urls')),
    
    # CSRF token endpoint
    path('api/csrf-token/', get_csrf_token, name='csrf_token'),
    
    # API documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)