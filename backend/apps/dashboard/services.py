import requests
from django.conf import settings
from .models import Task
from django.db.models import Q

def _determine_origin(user, target_date, start_time, origin_preference, custom_origin):
    if origin_preference == "home":
        return getattr(user, 'default_location', 'București, România')
    elif origin_preference == "custom" and custom_origin:
        return custom_origin
    else:
        previous_task = Task.objects.filter(
            user=user, date=target_date, end_time__lte=start_time
        ).order_by("-end_time").first()

        if previous_task and previous_task.location:
            return previous_task.location
        return getattr(user, 'default_location', 'București, România')

def calculate_transit_time_google(origin: str, destination: str, mode: str) -> int:

    if not origin or not destination:
        return 0

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

        if data['status'] == 'OK' and data['rows'][0]['elements'][0]['status'] == 'OK':
            duration_seconds = data['rows'][0]['elements'][0]['duration']['value']
            return duration_seconds // 60
    except Exception as e:
        print(f"Eroare la integrarea Google Maps: {e}")

    return 0


def create_task(user, validated_data: dict) -> Task:
    target_date = validated_data.get("date")
    start_time = validated_data.get("start_time")
    destination = validated_data.get("location")
    transport_mode = validated_data.get("transport_mode")

    origin_preference = validated_data.pop("origin_preference", "previous")
    custom_origin = validated_data.pop("custom_origin", "")

    origin = _determine_origin(user, target_date, start_time, origin_preference, custom_origin)

    if origin and destination:
        transit_time = calculate_transit_time_google(origin, destination, transport_mode)
    else:
        transit_time = 0

    task = Task.objects.create(
        user=user,
        estimated_transit_time=transit_time,
        **validated_data
    )
    return task


def get_daily_timeline(user, specific_date):
    weekday_str = str(specific_date.weekday())


    tasks = Task.objects.filter(
        Q(user=user, date=specific_date, recurring_days__exact="") |
        Q(user=user, date=specific_date, recurring_days__isnull=True) |
        (
            Q(user=user, date__lte=specific_date, recurring_days__contains=weekday_str) &
            (Q(recurrence_end_date__gte=specific_date) | Q(recurrence_end_date__isnull=True))
        )
    ).order_by("start_time")

    return tasks

def estimate_task_transit(user, target_date, start_time, destination, transport_mode, origin_preference="previous", custom_origin="") -> int:
    if not destination or not start_time or not target_date:
        return 0
    origin = _determine_origin(user, target_date, start_time, origin_preference, custom_origin)
    return calculate_transit_time_google(origin, destination, transport_mode)


def get_location_suggestions(query: str) -> list:
    if not query or len(query) < 3:
        return []

    api_key = getattr(settings, 'GOOGLE_MAPS_API_KEY', '')
    url = f"https://maps.googleapis.com/maps/api/place/autocomplete/json?input={query}&key={api_key}&language=ro"

    try:
        response = requests.get(url)
        data = response.json()

        if data.get('status') == 'OK':
            return [prediction['description'] for prediction in data.get('predictions', [])]
    except Exception as e:
        print(f"Eroare la Google Places API: {e}")

    return []