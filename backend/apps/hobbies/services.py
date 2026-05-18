import google.generativeai as genai
from django.conf import settings
import json

def get_hobby_suggestion(user, free_minutes, current_energy='Medium'):
    if not hasattr(settings, 'GEMINI_API_KEY') or not settings.GEMINI_API_KEY:
        return {"error": "Gemini API Key is not configured."}

    genai.configure(api_key="dummy")

    # Încercăm modelul cel mai stabil pentru Flash 1.5
    try:
        model = genai.GenerativeModel('gemini-3-flash-preview')

        hobbies = user.hobby_set.all()
        hobbies_list = [f"{h.name} ({h.energy_required} energy)" for h in hobbies]

        prompt = f"""
        You are a personal productivity assistant. 
        User has {free_minutes} minutes free and an energy level of {current_energy}.
        Their active hobbies are: {hobbies_list}.

        Suggest the best hobby for this time slot. If no hobby fits perfectly, suggest the closest one.
        Provide a short, motivating reason in the same language as the selected hobby.

        Return ONLY a JSON object with these keys: "hobby", "reason".
        """

        response = model.generate_content(prompt)
        clean_json = response.text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_json)

    except Exception as e:
        # Dacă 'gemini-1.5-flash-latest' eșuează, încercăm varianta simplă
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            # ... (aceeași logică de curățare JSON)
            return json.loads(response.text.replace('```json', '').replace('```', '').strip())
        except Exception as second_error:
            return {"error": f"AI Error: {str(second_error)}"}