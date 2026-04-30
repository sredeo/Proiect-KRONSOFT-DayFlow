from .models import Test

def create_test(title: str, content: str) -> Test:
    return Test.objects.create(title=title, content=content)

def list_test():
    return Test.objects.all()