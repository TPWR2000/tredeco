# 📅 Tredeco Calendar System
![Status: Production](https://img.shields.io/badge/Status-Production-green)
![React](https://img.shields.io/badge/tech-React--TS-blue)

**Tredeco** to nowoczesna, geometryczna reforma kalendarza, zaprojektowana z myślą o harmonii matematycznej i biologicznej. System oferuje stałą strukturę dni (cykle 28-dniowe) przy zachowaniu pełnej synchronizacji z kalendarzem gregoriańskim.

---

## 🚀 Główne Funkcje
* **Automatyczne Odświeżanie**: System co 60 000 ms (1 minuta) weryfikuje datę, aby uniknąć błędów po zmianie doby lub wybudzeniu urządzenia.
* **Pełny Kalendarz Limes**: Specjalna wizualizacja 14. miesiąca (Limes) z obsługą dni synchronizacji **Nilo** i **Bix**.
* **Potężna Skalowalność**: Walidacja lat w zakresie od **1 do 100 000**.
* **PWA Ready**: Możliwość instalacji aplikacji na pulpicie telefonu/komputera i praca w trybie offline.

---

## 🛠️ Specyfikacja Techniczna (Fact Sheet)

### 1. Logika Kalendarza
* **Struktura Roku**: 13 pełnych miesięcy (28 dni) + 1 miesiąc techniczny (Limes).
* **Sekwencja Miesięcy**: Primo, Secundo, Terzo, Quarto, Quinto, Sexto, Septo, Octo, Nono, Decimo, Undeco, Duodeco, Tredeco, Limes.
* **Algorytm Bix (Rok Przestępny)**: Rok Tredeco $Y$ jest przestępny, jeśli rok gregoriański $Y+1$ jest przestępny.
* **Punkt Synchronizacji**: 1 Primo odpowiada zawsze **1 marca** w kalendarzu gregoriańskim.

### 2. Dni Synchronizacji
* **Nilo**: 365. dzień roku, mapowany jako **Sobota** (zamyka miesiąc Limes).
* **Bix**: Dodatkowy dzień przestępny, mapowany jako **Niedziela**.

### 3. Stack Technologiczny
* **Framework**: React 19 + TypeScript + Vite 7.
* **Stylizacja**: Tailwind CSS 3.
* **Biblioteki**: `date-fns`, `lucide-react`, `suncalc`, `react-router-dom`.
* **Deployment**: GitHub Pages via `npm run deploy` z zachowaniem domeny `tredeco.pl` (plik CNAME).

---

## 🏗️ Rozwój i Git
W projekcie stosujemy profesjonalny workflow:
1. **Branche**: Nowe funkcje powstają na gałęziach `feature/` lub `docs/`.
2. **Commity**: Wiadomości commitów piszemy konsekwentnie w **języku polskim** (np. `funkcja:`, `poprawka:`, `dokumentacja:`).
3. **Merge**: Po przetestowaniu zmiany są scalane do gałęzi `main` i publikowane.

---

## 🚀 Uruchomienie
```bash
npm install
npm run dev     # Środowisko lokalne
npm run deploy  # Publikacja na tredeco.pl