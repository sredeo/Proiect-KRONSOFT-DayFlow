import requests
from django.conf import settings
from .models import Task


def calculate_transit_time_google(origin: str, destination: str, mode: str) -> int:
    """Apeleaza Google Maps Distance Matrix API."""
    if not origin or not destination:
        return 0

    # Mapam modurile noastre la cele pe care le intelege Google
    mode_mapping = {
        "car": "driving",
        "walking": "walking",
        "transit": "transit"
    }
    google_mode = mode_mapping.get(mode, "driving")

    api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', '')
    url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin}&destinations={destination}&mode={google_mode}&key={api_key}"

    try:
        response = requests.get(url)
        data = response.json()

        # Verificam daca Google a gasit rute
        if data['status'] == 'OK' and data['rows'][0]['elements'][0]['status'] == 'OK':
            # Extragem timpul in secunde si transformam in minute
            duration_seconds = data['rows'][0]['elements'][0]['duration']['value']
            return duration_seconds // 60
    except Exception as e:
        print(f"Eroare la integrarea Google Maps: {e}")

    return 0  # Daca ceva pica, returnam 0 ca fallback


def create_task(user, validated_data: dict) -> Task:
    target_date = validated_data.get("date")
    start_time = validated_data.get("start_time")
    destination = validated_data.get("location")
    transport_mode = validated_data.get("transport_mode")

    # 1. Cautam care este ultimul task dinaintea acestuia pentru a afla de unde plecam
    previous_task = Task.objects.filter(
        user=user,
        date=target_date,
        end_time__lte=start_time  # Se termina inainte sa inceapa cel nou
    ).order_by("-end_time").first()

    # Daca exista un task anterior, plecam de acolo. Altfel, setam o locatie default
    if previous_task and previous_task.location:
        origin = previous_task.location
    else:
        origin = user.default_location

    # 2. Calculam timpul real de tranzit
    if origin and destination:
        transit_time = calculate_transit_time_google(origin, destination, transport_mode)
    else:
        transit_time = 0

    # 3. Salvam task-ul in baza de date
    task = Task.objects.create(
        user=user,
        estimated_transit_time=transit_time,
        **validated_data
    )
    return task


def get_daily_timeline(user, specific_date):
    return Task.objects.filter(user=user, date=specific_date).order_by("start_time")