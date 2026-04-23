# Frontend Wedding Planner

Frontend aplikacji Wedding Planner oparty o React + TypeScript + Vite.

## Uruchomienie

```bash
npm install
npm run dev
```

Build produkcyjny:

```bash
npm run build
```

## Architektura

Struktura projektu jest przygotowana pod rozwoj biznesowy i prace zespolowa:

- `src/components/common` - wspoldzielone komponenty UI
- `src/features` - moduly funkcjonalne (auth, events, tasks, budget, vendors, guests)
- `src/store` - globalny stan aplikacji (Redux Toolkit)
- `src/api` - komunikacja z backendem i podstawa pod JWT
- `src/app` - konfiguracja aplikacji (routing)

## Routing

Routing jest skonfigurowany przez `createBrowserRouter` i obejmuje:

- `/` - panel glowny
- `/events` - harmonogram przygotowan
- `/tasks` - zadania
- `/budget` - budzet
- `/vendors` - dostawcy
- `/guests` - goscie
- `/login` - logowanie

## Integracja z backendem

Warstwa `src/api/httpClient.ts` korzysta z `VITE_API_URL` (domyslnie `http://localhost:8080`).
Przyklad endpointu logowania jest przygotowany w `src/api/authApi.ts`.
