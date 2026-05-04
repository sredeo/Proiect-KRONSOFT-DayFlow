from .models import Task
import random  #temporar


def create_task(user, validated_data: dict) -> Task:
    """Creeaza un task nou si calculeaza tranzitul."""
    # Aici ar veni "Validarea Live"
    # Momentan mimam un apel catre un API de harti (ex: Google Maps)
    tranzit_simulat = calculate_transit_time(validated_data.get("transport_mode"))

    # Cream task-ul si il asociem user-ului
    task = Task.objects.create(
        user=user,
        estimated_transit_time=tranzit_simulat,
        **validated_data
    )
    return task


def get_daily_timeline(user, specific_date):
    """Returneaza timeline-ul zilei ordonat cronologic."""
    return Task.objects.filter(user=user, date=specific_date).order_by("start_time")


def calculate_transit_time(transport_mode: str) -> int:
    """Functie dummy care va fi inlocuita cu integrarea Google Maps/OSM."""
    if transport_mode == "car":
        return random.randint(10, 25)
    elif transport_mode == "walking":
        return random.randint(30, 60)
    return random.randint(15, 40)  # Transport comun