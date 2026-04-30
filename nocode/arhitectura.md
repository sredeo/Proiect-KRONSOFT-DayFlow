## 📱 Arhitectura și Navigare (Persistent Bottom Tab Bar)

Navigarea principală se realizează printr-un **Bottom Navigation Bar static**, vizibil în permanență, care asigură trecerea instantanee între cele 5 ecrane de bază ale aplicației. Butonul central este supradimensionat pentru a evidenția nucleul aplicației.

### 1. 🏠 Dashboard & Smart Timeline (Butonul Central)
Centrul de comandă al zilei tale.

**Afișaje (Displays):**
* **Timeline-ul Zilei:** O listă verticală scrollabilă cu toate task-urile zilei ordonate cronologic.
* **Carduri Contextuale de Task:** * *Task Normal/Întâlnire:* Afișează titlul, ora și timpul estimat de tranzit până acolo.
    * *Task Workout:* Afișează un sumar rapid (ex. „Ziua de Spate: 5 exerciții”). Tap pe el deschide direct pagina de antrenament.
* **Bannere de Alertă (Time & Distance):** Avertizări colorate (ex. *„Atenție: Ajungi cu doar 2 min înainte de întâlnire!”*).

**Butoane & Formulare:**
* **Butonul [+ Adaugă Task]:** Deschide formularul inteligent de creare eveniment.
* **Formular Creare Task:**
    * *Categorii:* Muncă, Workout, Întâlnire, Cumpărături etc.
    * *Opțiuni Locație:* Locația curentă / Introducere adresă / Locații Favorite.
    * *Mod de Deplasare:* Mașină 🚗, Pe jos 🚶, Transport comun 🚌.
    * **Validare Live:** Afișează timpul de deplasare de la task-ul anterior *înainte* de a apăsa butonul [Salvează].

### 2. 🏋️ Workout Scheduler & Tracker
Gestionarea completă a formei fizice și a istoricului de progres.

**Afișaje (Displays):**
* **Bara de Zile:** Navigare orizontală rapidă (Luni - Duminică) pentru vizualizarea split-ului.
* **Listă Exerciții & Istoric:** Carduri pentru fiecare exercițiu planificat, incluzând istoricul kilogramelor ridicate săptămâna trecută (pentru *progressive overload*).
* **Raport de Final de Zi:** Un sumar generat la finalizarea antrenamentului, care oferă feedback și sugestii de îmbunătățire pe baza kilogramelor ridicate.

**Butoane & Formulare:**
* **[Setează Split Săptămânal]:** Asociază grupe musculare fiecărei zile.
* **[+ Adaugă Exercițiu]:** Căutare din baza de date de exerciții.
* **Formular Logare Seturi:** Input-uri pentru numărul de [Seturi], [Repetări], [Kilograme] și buton de [Bifează Set].
* **[Finalizează Antrenament]:** Salvează sesiunea curentă și generează sumarul zilnic.

### 3. 🥦 Nutrition Planner
Control total asupra aportului caloric și nutrițional.

**Afișaje (Displays):**
* **Macro Tracker în Timp Real:** 4 bare de progres (Calorii, Proteine, Carbohidrați, Grăsimi) care se umplu vizual la adăugarea alimentelor.
* **Jurnalul Mesele Zilei:** Secțiuni pentru Mic Dejun, Prânz, Cină, Gustări.

**Butoane & Formulare:**
* **[Setează Target Manual]:** Formular pentru introducerea exactă a valorilor nutriționale vizate (ținte manuale de macro).
* **[+ Adaugă Aliment]:** Deschide bara de căutare pentru produse nutriționale.
* **[Generează Listă Cumpărături]:** Extrage automat necesarul din planul alimentar și creează un checklist.

### 4. 🎸 Hobby & Free Time Optimizer
Sistem inteligent care te asigură că nu îți ignori timpul liber.

**Afișaje (Displays):**
* **Lista Hobby-uri Active:** Afișează progresul săptămânal (ex. *Chitară: 2/4 sesiuni*).
* **Carduri de Sugestii Proactive:** Apar doar când aplicația găsește ferestre libere între task-uri (ex. *„Ai 45 min libere la ora 14:00. Vrei să citești?”*).

**Butoane & Formulare:**
* **[+ Adaugă Hobby]:** Setezi frecvența dorită (de câte ori pe săptămână).
* **[Acceptă Sugestia]:** Plasează automat hobby-ul sugerat în fereastra liberă din calendar.
* **[Bifează ca Făcut]:** Înregistrează streak-ul pentru motivare.

### 5. ⚙️ Settings
Gestiunea tehnică a aplicației și a preferințelor.

**Secțiuni & Butoane:**
* **[Gestionează Locații Favorite]:** Salvezi coordonate fixe pentru *Acasă*, *Birou*, *Sală*, *Facultate*.
* **Preferințe Deplasare:** Dropdown pentru modul de transport implicit.
* **Setări Notificări:** Comutatoare (Toggles) pentru alarmele de tranzit și hobby-uri.
* **Secțiunea Cont:** Date profil și buton [Logout] (Google Auth).
