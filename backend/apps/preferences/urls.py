from django.urls import path
from .views import PreferencesView, FavoriteLocationView, FavoriteLocationDetailView

urlpatterns = [
    path('settings/preferences/', PreferencesView.as_view(), name='user_preferences'),
    path('settings/locations/', FavoriteLocationView.as_view(), name='favorite_locations'),
    path('settings/locations/<int:location_id>/', FavoriteLocationDetailView.as_view(), name='delete_location'),
]