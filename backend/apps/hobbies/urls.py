from django.urls import path
from .views import HobbyListCreateView, HobbyDetailView, SuggestHobbyView, LogHobbySessionView

urlpatterns = [
    path('', HobbyListCreateView.as_view(), name='hobby-list'),
    path('<int:pk>/', HobbyDetailView.as_view(), name='hobby-detail'),
    path('suggest/', SuggestHobbyView.as_view(), name='hobby-suggest'),
    path('log/', LogHobbySessionView.as_view(), name='hobby-log'),
]