from rest_framework.views import APIView
from rest_framework.response import Response
from .services import create_test, list_test
from .serializers import TestSerializer

class TestView(APIView):

    def get(self, request):
        tests = list_test()
        return Response(TestSerializer(tests, many=True).data)

    def post(self, request):
        test = create_test(title=request.data.get("title"), content=request.data.get("content")p)
        return Response(TestSerializer(test).data)