from dj_rest_auth.serializers import JWTSerializer
from users.serializers import UserSerializer

class CustomJWTSerializer(JWTSerializer):
    user = UserSerializer()

    class Meta:
        fields = ('access_token', 'refresh_token', 'user')