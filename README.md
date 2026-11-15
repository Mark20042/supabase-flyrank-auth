# FlyRank Auth API · Login & Protect (Assignment A4)

A secure authentication and route protection REST API built with **Node.js**, **Express**, and **Supabase Auth**.

This backend implements a stateless JWT-based authentication workflow with reusable middleware protection, interactive Swagger UI documentation, and input validation without storing or hashing passwords manually.

---

## 🏗️ Architecture & The Trust Triangle

Authentication in this service relies on a trust triangle between the **Client**, our **Express Server**, and **Supabase Auth** as the Identity Provider (IdP):

1. **Sign Up / Login:** Client sends credentials directly to our backend, which forwards them to Supabase Auth (`signUp` / `signInWithPassword`). Supabase handles secure password hashing and returns a signed JSON Web Token (JWT access token).
2. **Accessing Protected Routes:** The client includes the JWT in the standard HTTP header:  
   `Authorization: Bearer <access_token>`
3. **Verification via Middleware:** Reusable Express middleware (`authMiddleware`) extracts the Bearer token and verifies it directly against Supabase via `supabase.auth.getUser(token)`. If the token is valid, the request proceeds with `req.user` attached; otherwise, it is immediately rejected with `401 Unauthorized`.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- A free [Supabase](https://supabase.com) account & project

### 2. Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Mark20042/supabase-flyrank-auth.git
   cd supabase-flyrank-auth
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (based on `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials:
   ```env
   PORT=3000
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_publishable_key
   ```
   > ⚠️ **Note:** In your Supabase Dashboard under **Authentication → Providers → Email**, turn **"Confirm email" OFF** for local development so newly registered users can log in immediately.

4. **Run the server:**
   ```bash
   npm run dev
   ```
   The server will start at `http://localhost:3000` and Swagger UI will be available at `http://localhost:3000/docs`.

---

## 📡 API Reference Table

| Method | Endpoint | Auth Required | Success Status | Error Statuses | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/public/info` | None | `200 OK` | — | Open public endpoint accessible to all visitors. |
| **POST** | `/auth/signup` | None | `201 Created` | `400 Bad Request` | Registers a new user with `email` and `password`. |
| **POST** | `/auth/login` | None | `200 OK` | `400 Bad Request`, `401 Unauthorized` | Authenticates credentials and returns JWT `access_token`. |
| **POST** | `/auth/logout` | `Bearer <JWT>` | `204 No Content` | `401 Unauthorized` | Ends the active session in Supabase. |
| **GET** | `/protected/profile` | `Bearer <JWT>` | `200 OK` | `401 Unauthorized` | Returns verified user details (`id`, `email`, `created_at`). |
| **GET** | `/protected/dashboard` | `Bearer <JWT>` | `200 OK` | `401 Unauthorized` | Second protected endpoint demonstrating reusable middleware. |

---

## 🧪 Testing the API

### 1. Register a new user:
```bash
curl -i -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"securePassword123!"}'
```

### 2. Log in to get an access token:
```bash
curl -i -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"securePassword123!"}'
```
*(Copy the `access_token` from the response)*

### 3. Access protected route with Bearer token:
```bash
curl -i http://localhost:3000/protected/profile \
  -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
```

### 4. Test Token Verification Guard (Tampered Token):
Change a single character in `<YOUR_ACCESS_TOKEN>` and send the request again. The server immediately rejects it with `401 Unauthorized`:
```json
{ "error": "Invalid or expired token" }
```

---

## 📖 Interactive Swagger UI Documentation

Swagger UI is served directly at:
```
http://localhost:3000/docs
```

### Authorizing via Swagger:
1. Open `http://localhost:3000/docs` in your browser.
2. Click the green **Authorize 🔓** button.
3. Paste your JWT access token (without the `Bearer` prefix) into the **Value** field and click **Authorize**.
4. All protected endpoints (`/protected/profile`, `/protected/dashboard`, `/auth/logout`) now show a locked padlock 🔒 and can be tested via **Try it out**.

![Swagger UI Screenshot](./docs/swagger-screenshot.png)

---

## 🔐 Security Concepts: 401 vs 403

- **`401 Unauthorized`:** *"I do not know who you are."* The request is missing credentials or presented an invalid/expired token.
- **`403 Forbidden`:** *"I know who you are, but you do not have permission to access this resource."* (e.g. an authenticated standard user trying to access an admin dashboard).

