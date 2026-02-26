# Tredeco - Geometria Czasu

Tredeco Web to nowoczesny kalendarz 13-miesieczny, w ktorym kazdy miesiac ma 28 dni.  
System zawiera unikalne Dni Synchronizacji: **Nilo** (365. dzien) oraz **Bix** (dzien przestepny).

## Funkcje

- Pelne wsparcie PWA (aplikacja dziala offline).
- Automatyczne obliczenia astronomiczne (wschod/zachod Slonca i Ksiezyca, faza Ksiezyca).
- Interaktywne opisy Nilo/Bix wyswietlane nad kursorem lub dotykiem.

## Jak uruchomic lokalnie

```bash
npm install
npm run dev
```

Domyslnie aplikacja uruchomi sie pod adresem podanym przez Vite (zwykle `http://localhost:5173`).

## Testy mobilne (PWA)

Podczas testow PWA na urzadzeniach mobilnych (lub emulacji) mozesz sprawdzic ustawienia w:

`chrome://flags`

W razie problemow z instalacja/trybem standalone zweryfikuj flagi zwiazane z PWA oraz Service Worker.
