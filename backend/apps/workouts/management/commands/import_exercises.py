import requests
import time
from django.core.management.base import BaseCommand
from ...models import Exercise


class Command(BaseCommand):
    help = 'Importă exerciții folosind Wger API (varianta corectă cu traduceri)'

    def handle(self, *args, **options):
        # Ne prezentăm ca un browser pentru a nu fi blocați
        headers = {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        self.stdout.write("Se descarcă exercițiile detaliate (pagină cu pagină)...")

        # Folosim endpoint-ul "exerciseinfo" care conține structura completă
        url = "https://wger.de/api/v2/exerciseinfo/?language=2"
        total_imported = 0
        page = 1

        while url:
            try:
                response = requests.get(url, headers=headers)

                if response.status_code != 200:
                    self.stdout.write(self.style.ERROR(f"Eroare la pagina {page}: {response.status_code}"))
                    break

                data = response.json()
                results = data.get('results', [])

                if not results:
                    break

                added_this_page = 0
                for item in results:
                    name_raw = ""

                    # 1. Căutăm numele în lista de traduceri
                    translations = item.get('translations', [])
                    for t in translations:
                        # 2 este ID-ul pentru limba engleză în Wger
                        if t.get('language') == 2:
                            name_raw = t.get('name', '').strip()
                            break

                    # Dacă nu am găsit un nume în engleză, sărim la următorul
                    if not name_raw:
                        continue

                    # 2. Extragem categoria din obiect
                    category_data = item.get('category')
                    if isinstance(category_data, dict):
                        muscle_label = category_data.get('name', 'General')
                    else:
                        muscle_label = "General"

                    # 3. Salvăm în baza de date
                    obj, created = Exercise.objects.get_or_create(
                        name=name_raw,
                        defaults={'muscle_group': muscle_label}
                    )

                    if created:
                        added_this_page += 1
                        total_imported += 1

                self.stdout.write(
                    f" -> Pagina {page} procesată: am găsit {len(results)} elemente, am salvat {added_this_page} noi.")

                # Trecem la următoarea pagină
                url = data.get('next')
                page += 1

                # Pauză de jumătate de secundă
                time.sleep(0.5)

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"A apărut o eroare neașteptată: {e}"))
                break

        final_count = Exercise.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f"Succes! Am importat {total_imported} exerciții de pe Wger. Total în DB: {final_count}."))