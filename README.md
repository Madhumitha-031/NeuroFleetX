# NeuroFleetX

NeuroFleetX is a full-stack fleet operations platform with role-based access for superusers, managers, drivers, and customers. The project combines a React/Vite frontend with a Spring Boot backend to support authentication, fleet visibility, appointment handling, notifications, document uploads, and operational dashboards.

## Overview

The application is organized as two main parts:

- `frontend/`: React 19 + Vite single-page application
- `backend/`: Spring Boot 3 REST API backed by MySQL

The platform includes:

- JWT-based authentication and login
- Email verification and password reset flows
- Role-specific dashboards for `SUPERUSER`, `MANAGER`, `DRIVER`, and `CUSTOMER`
- Vehicle/fleet management with status and location updates
- Driver availability and appointment booking
- Notification and activity tracking
- User document upload/download support
- Seeded demo users and fleet data for local development

## Tech Stack

### Frontend

- React 19
- Vite 6
- React Router
- Axios
- Framer Motion
- React Toastify
- Recharts
- Leaflet / React Leaflet
- Lucide React

### Backend

- Java 17
- Spring Boot 3.2.3
- Spring Web
- Spring Security
- Spring Data JPA
- MySQL
- JWT (`jjwt`)
- Thymeleaf
- Spring Mail
- Lombok

## Project Structure

```text
NeuroFleetX/
|-- backend/
|   |-- src/main/java/com/neurofleetx/backend/
|   |   |-- config/
|   |   |-- controller/
|   |   |-- dto/
|   |   |-- model/
|   |   |-- repository/
|   |   |-- security/
|   |   `-- service/
|   `-- src/main/resources/application.properties
|-- frontend/
|   |-- public/
|   `-- src/
|       |-- assets/
|       |-- components/
|       |-- context/
|       `-- pages/
|-- package.json
`-- README.md
```

## Main Functional Areas

### Authentication and user management

- User registration and login
- Email verification
- Password reset
- Profile and account management
- Admin approval flows for operational users

### Fleet and operations

- Fleet listing and seeded vehicle data
- Vehicle status updates
- Vehicle location updates
- Driver-to-vehicle lookup
- Fleet map visualization in the frontend

### Scheduling

- Driver availability management
- Available-slot discovery
- Appointment booking for customers
- Appointment status updates and reassignment by admins

### Documents and notifications

- Upload, list, download, and delete user documents
- Notification retrieval and mark-as-read actions
- Activity logging for key operational events

## Local Development Setup

### Prerequisites

- Node.js 18+ recommended
- Java 17
- Maven
- MySQL 8+

### 1. Backend setup

From `backend/`, configure the database in:

- `backend/src/main/resources/application.properties`

Current backend defaults:

- Port: `9090`
- Database: `neurofleetx_db`
- JDBC URL: `jdbc:mysql://localhost:3306/neurofleetx_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`

Start the backend:

```powershell
cd backend
mvn spring-boot:run
```

### 2. Frontend setup

Install dependencies and start Vite:

```powershell
cd frontend
npm install
npm run dev
```

The frontend typically runs on:

- `http://localhost:5173`

## Demo Seed Data

The backend seeds a default superuser and sample operational accounts on startup.

Demo accounts:

- Superuser: `admin` / `admin123`
- Manager: `manager1@neurofleetx.com` / `manager123`
- Driver: `driver1@neurofleetx.com` / `driver123`
- Customer: `customer1@neurofleetx.com` / `customer123`

It also attempts to seed fleet data through the backend startup flow.

## Important API Areas

Representative backend routes include:

- `/api/auth/*`
- `/api/vehicles/*`
- `/api/agent/*`
- `/api/documents/*`
- `/api/notifications/*`

Notable behavior observed in the codebase:

- The frontend calls the backend directly at `http://localhost:9090`
- JWT tokens are stored in browser local storage
- The application relies on MySQL and auto-updates schema with `spring.jpa.hibernate.ddl-auto=update`

## Notes and Caveats

- The repository currently contains hardcoded local credentials and mail settings in `backend/src/main/resources/application.properties`. Move these to environment-specific configuration before deploying or sharing publicly.
- Some controllers allow CORS from `http://localhost:3000`, while the Vite frontend normally runs on `http://localhost:5173`. If requests fail in the browser, align the allowed origins in the backend.
- The top-level `package.json` contains shared dependencies, but the runnable frontend app is in `frontend/`.
- The project folder I analyzed does not currently appear to be initialized as a Git repository at the top level, so you may need to run `git init` here or work from the actual repo root before pushing.

## Suggested Next Improvements

- Move secrets and environment-specific values to `.env` or external config
- Add backend and frontend test coverage
- Introduce a single configuration source for API base URLs
- Add Docker support for MySQL, backend, and frontend
- Create a proper API reference or Swagger/OpenAPI setup

## Summary

NeuroFleetX is a solid starter platform for fleet operations and service scheduling. It already includes role-based workflows, live operational views, seeded data, and a clear separation between frontend and backend, making it a good foundation for further product and deployment work.
