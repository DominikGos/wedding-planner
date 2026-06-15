# Wedding Planner

A client-server wedding planning application built with Spring Boot (backend) and React (frontend).

## Tech Stack

- **Backend**: Java 17, Spring Boot 4.0.3, Spring Security + OAuth2 (Google), JPA/Hibernate, Oracle Database
- **Frontend**: React 19, TypeScript, Vite, Redux Toolkit, React Router
- **Testing**: JUnit 5, Mockito, WebTestClient, H2 (test DB), JaCoCo

## Design Patterns

| Pattern | Implementation |
|---|---|
| Singleton | `ScheduleGenerator` – double-checked locking |
| Factory | `TaskFactory` – abstract factory with type-specific concrete factories |
| Strategy | `TaskCostStrategy` – injected via Spring `Map<String, TaskCostStrategy>` |
| Observer | Spring `@EventListener` / `ApplicationEventPublisher` |

## Project Structure

```
backend/wedding-planner/   Spring Boot REST API (port 8080)
  ├── src/main/java/       controllers, services, entities, repositories, factory, events
  └── src/test/java/       unit tests, integration tests (WebTestClient), pattern tests
frontend/                  React SPA (port 5173, proxied to backend)
  ├── src/api/             HTTP client + API modules
  ├── src/features/        page components (Events, Tasks, Guests, Vendors, etc.)
  └── src/store/           Redux slices
```

## Quick Start

1. Configure Oracle connection in `application.properties` (or use `application-test.properties` with H2).
2. Start backend: `./mvnw spring-boot:run` from `backend/wedding-planner/`.
3. Start frontend: `npm run dev` from `frontend/`.
4. Open `http://localhost:5173`.

## Testing

```bash
cd backend/wedding-planner
./mvnw test
```
