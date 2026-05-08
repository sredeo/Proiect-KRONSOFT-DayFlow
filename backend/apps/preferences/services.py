from .models import UserPreferences, FavoriteLocation

def get_user_preferences(user):
    """Returneaza preferintele userului. Daca nu exista inca, le creeaza automat."""
    prefs, created = UserPreferences.objects.get_or_create(user=user)
    return prefs

def update_user_preferences(user, validated_data: dict):
    """Actualizeaza setarile (ex: schimba modul de transport sau opreste notificarile)."""
    prefs = get_user_preferences(user)
    for key, value in validated_data.items():
        setattr(prefs, key, value)
    prefs.save()
    return prefs

def get_favorite_locations(user):
    """Returneaza toate locatiile favorite ale userului."""
    return FavoriteLocation.objects.filter(user=user)

def add_favorite_location(user, validated_data: dict):
    """Adauga o locatie noua (ex: Birou)."""
    return FavoriteLocation.objects.create(user=user, **validated_data)

def delete_favorite_location(user, location_id: int):
    """Sterge o locatie din lista de favorite."""
    FavoriteLocation.objects.filter(user=user, id=location_id).delete()