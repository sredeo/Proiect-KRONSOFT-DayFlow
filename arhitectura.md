## 📱 Arhitectura și Navigare

Navigarea principală se realizează printr-un **Bottom Navigation Bar static**, vizibil în permanență (similar cu Instagram sau Spotify), care asigură trecerea instantanee între cele 5 module de bază ale aplicației. Butonul central este supradimensionat pentru a evidenția nucleul aplicației.

### 1. 🏠 Dashboard 
Este centrul de comandă al zilei tale.
* **Timeline Dinamic:** Listă cronologică cu task-uri, antrenamente și mese.
* **Smart Transit Engine:** * Calculează automat timpul de deplasare între task-uri folosind Google Maps.
    * **Avertizare de siguranță:** "Vezi că ajungi cu doar 2 minute înainte" pentru întâlniri importante.
* **Adăugare Task rapid:** * Opțiuni locație: Locație curentă, Căutare adresă sau Locații Favorite (Acasă, Job, Sală).
    * Mod de deplasare: Mașină 🚗, Pe jos 🚶, Transport în comun 🚌.
    * **Validare Live:** Vezi timpul necesar de deplasare *înainte* de a salva task-ul.

### 2. 🏋️ Workout Scheduler & Tracker
Gestionarea completă a formei fizice.
* **Split Săptămânal:** Configurezi ce grupe lucrezi în fiecare zi.
* **Tracking Detaliat:** Loghezi seturi, repetări și, cel mai important, **greutățile (kg)** folosite pentru a monitoriza progresul față de săptămâna trecută.
* **Sumar în Dashboard:** Task-urile de tip workout apar în timeline cu un rezumat (ex: "Spate - 5 exerciții").
* **Feedback:** Raport la finalul zilei cu sugestii de îmbunătățire bazate pe performanța logată.

### 3. 🥦 Nutrition Planner
Control total asupra aportului caloric.
* **Target Personalizat:** Posibilitatea de a introduce manual țintele de calorii, proteine, carbohidrați și grăsimi.
* **Macro Tracking:** Bare de progres vizuale care se actualizează pe măsură ce adaugi alimente.
* **Listă de Cumpărături:** Generată automat pe baza planului alimentar săptămânal.

### 4. 🎸 Hobby & Free Time Optimizer
Nu lăsa timpul liber să se irosească.
* **Hobby Tracking:** Setezi frecvența dorită (ex: Chitară de 4x pe săptămână).
* **Smart Suggestions:** Aplicația scanează "găurile" din program și îți propune să ocupi ferestrele libere cu hobby-urile tale.
* **Streak Tracking:** Te motivează să menții continuitatea.

### 5. ⚙️ Settings
* **Gestiune Locații Favorite:** Salvezi adresele frecventate pentru adăugare rapidă.
* **Preferințe Deplasare:** Setezi modul de transport implicit.
* **Profil:** Configurare obiective și Logout (Google Auth).


