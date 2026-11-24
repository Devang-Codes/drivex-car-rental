# DriveX — Car Rental Management System

DriveX is a full-stack car rental management application. Customers can create accounts, browse vehicles, submit date-based reservations, and manage their own bookings. Administrators can manage fleet inventory and process every customer booking.

## Features

### Customer
- Register and sign in with hashed passwords and JWT authentication.
- Browse, search, filter and view the vehicle fleet.
- Submit a booking with customer contact details, pickup/return dates and rental notes.
- Automatic rental-day and price calculation.
- Server-side date validation and overlapping-date conflict prevention.
- View account-specific booking history and cancel pending requests.

### Administrator
- Protected admin dashboard using role-based authorization.
- Add, edit and delete fleet vehicles.
- View all customer booking requests and contact details.
- Approve, reject, cancel or complete bookings.
- Active bookings prevent deletion of the associated vehicle.

### Platform
- React + Vite frontend, Express REST API and SQLite database.
- Password hashing with bcryptjs and signed JWT access tokens.
- SQLite database file persisted under `server/data/`.
- Responsive layout and dark/light theme.

## Requirements
- Node.js 20.19+ or 22.12+ recommended.
- npm 10+.

## Windows PowerShell setup

1. Extract the project ZIP and open the `drivex-car-rental` folder in VS Code.
2. Install dependencies:

```powershell
npm install
```

3. Create frontend and backend environment files:

```powershell
Copy-Item .env.example .env
Copy-Item server/.env.example server/.env
```

4. Open **Terminal 1** and start the API:

```powershell
npm run server
```

Before starting the API, open `server/.env` and set your own private administrator email, a unique password of at least 12 characters, and a random JWT secret of at least 32 characters. Do not share this file or commit it to GitHub. The API runs at `http://localhost:5000`. The first run creates `server/data/drivex.sqlite`, seeds the sample fleet, and creates the administrator using only the private values you configured.

5. Open **Terminal 2** and start React:

```powershell
npm run dev
```

6. Open `http://localhost:5173`.

## Administrator account security

- The login page does not display or reveal administrator credentials.
- There are no hardcoded demo administrator credentials in the application.
- Configure `ADMIN_EMAIL` and `ADMIN_PASSWORD` only in the private `server/.env` file.
- On startup, the backend creates or synchronizes the administrator account from those private environment values. This also migrates the old demo administrator account to the newly configured credentials when the existing SQLite database is reused.
- Never publish `server/.env`, database files, or administrator credentials. The `.gitignore` excludes local environment files and database data.

## Booking availability logic

A reservation is treated as occupying a vehicle while its status is `Pending` or `Approved`. Two reservations conflict when the existing pickup date is earlier than the new return date **and** the existing return date is later than the new pickup date. This uses half-open date intervals, so a vehicle returned on a date can be rented again starting that same date. The API performs this check before inserting the booking. Rejected and cancelled bookings no longer block those dates.

## API overview

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create customer account |
| POST | `/api/auth/login` | Public | Sign in |
| GET | `/api/auth/me` | Signed in | Current account |
| GET | `/api/vehicles` | Public | List vehicles |
| POST | `/api/vehicles` | Admin | Add vehicle |
| PUT | `/api/vehicles/:id` | Admin | Edit vehicle |
| DELETE | `/api/vehicles/:id` | Admin | Delete vehicle |
| GET | `/api/bookings` | Signed in | Own bookings; all bookings for admin |
| POST | `/api/bookings` | Customer | Create reservation request |
| PATCH | `/api/bookings/:id/cancel` | Booking owner | Cancel pending request |
| PATCH | `/api/bookings/:id/status` | Admin | Change booking status |

## Production security checklist

This is an educational internship/portfolio implementation, not a ready-to-operate rental business. Before public production use: set a strong random `JWT_SECRET`; use HTTPS; configure a specific `CLIENT_ORIGIN`; use managed persistent database storage and backups; add rate limiting, email verification, password reset, audit logs, CSRF protections appropriate to the token strategy, input validation, monitoring and privacy/legal controls. JWTs are stored in browser localStorage in this demo, which is vulnerable to token theft if an XSS flaw is introduced. Payment processing is not implemented.

## Build

```powershell
npm run build
```

The production frontend is generated in `dist/`. Deploy the frontend and API separately or configure a reverse proxy; set `VITE_API_URL` to the deployed API base URL and configure the API's `CLIENT_ORIGIN`.
