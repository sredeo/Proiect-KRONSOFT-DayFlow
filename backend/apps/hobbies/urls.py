from django.urls import path
from .views import HobbyListCreateView, HobbyDetailView, SuggestHobbyView, LogHobbySessionView

urlpatterns = [
    path('hobbies/', HobbyListCreateView.as_view(), name='hobby-list'),
    path('hobbies/<int:pk>/', HobbyDetailView.as_view(), name='hobby-detail'),
    path('hobbies/suggest/', SuggestHobbyView.as_view(), name='hobby-suggest'),
    path('hobbies/log/', LogHobbySessionView.as_view(), name='hobby-log'),
]