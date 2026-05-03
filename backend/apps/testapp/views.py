from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .services import create_test, list_test
from .serializers import TestSerializer

class TestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tests = list_test()
        return Response(TestSerializer(tests, many=True).data)

    def post(self, request):
        test = create_test(title=request.data.get("title"), content=request.data.get("content"))
        return Response(TestSerializer(test).data)