from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status 
from .serializers import RegisterSerializer,LoginSerializer


class RegisterView(APIView):
    def post(self,request):
        try:
            data = request.data 
            serializer = RegisterSerializer(data=data)
            
            if not serializer.is_valid():
                return Response({'data':serializer.errors,'message':"somethingwent wrong"},status=status.HTTP_400_BAD_REQUEST)   
            
            serializer.save()
            
            return Response({'data':{},'message':"Your account is created"},status= status.HTTP_201_CREATED)
        
        except Exception as e:
            print("******")
            print(e)
            return Response({'data':{},'message':"somethingwent wrong"},status=status.HTTP_400_BAD_REQUEST)
        

class LoginView(APIView):
    def post(self, request):
        try:
            data = request.data 
            serializer = LoginSerializer(data=data)
            
            if not serializer.is_valid():
                return Response({'data': serializer.errors, 'message': "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)   
            
            token_data = serializer.get_jwt_token(serializer.validated_data)
            if 'access' not in token_data['data']:
                return Response(token_data, status=status.HTTP_401_UNAUTHORIZED)
            
            return Response(token_data, status=status.HTTP_200_OK)
        
        except Exception as e:
            print("Exception:", e)
            return Response({'data': {}, 'message': "Something went wrong"}, status=status.HTTP_400_BAD_REQUEST)