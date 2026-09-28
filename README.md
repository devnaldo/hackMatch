# 🚀 HackMatch — Smart Hackathon Team Builder & Collaboration Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-21.x-339933.svg?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000.svg?style=flat-square&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-2D3748.svg?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg?style=flat-square&logo=redis)](https://redis.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101.svg?style=flat-square&logo=socketdotio)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED.svg?style=flat-square&logo=docker)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

**HackMatch** is a full-stack, real-time web platform engineered to solve one of the biggest challenges in collegiate and professional hackathons: **forming balanced, high-performing teams quickly and efficiently**.

The platform combines an **algorithmic compatibility engine**, **instant WebSocket messaging**, **project idea brainstorm boards**, and **hackathon tracking** into a responsive interface designed for both organizers and hackers.

---

## 🌟 Key Highlights & Features

- 🎯 **Algorithmic Compatibility Engine**: Quantifies user-to-user and team-to-user synergy scores based on required skills, tech stack complementarity, experience level, and hackathon interest.
- ⚡ **Real-Time Collaboration (WebSockets)**: Low-latency team chat powered by Socket.IO featuring live typing indicators, room broadcasting, and instant activity alerts.
- 🔔 **Instant Notification Hub**: Real-time push notifications for team invitations, join requests, approval status updates, and deadline reminders.
- 💡 **Project Ideation Marketplace**: Brainstorm, submit, and upvote project concepts categorized by domain (AI, Web3, FinTech, HealthTech, etc.) with direct linking to active teams.
- 🛡️ **Robust Security Architecture**: Stateless JWT authentication with salted BCrypt password hashing, request rate-limiting, and role-based access control (RBAC).
- 📊 **Admin Moderation & Insights**: Dedicated admin panel providing platform telemetry, active user filtering, and user moderation controls.
- 🧪 **One-Command Mock Seeder**: Pre-populates realistic hackers, hackathons, skills, and active teams for instant demonstration out of the box.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 Client Layer (React 19 + Vite)              │
│      Tailwind CSS  │  Zustand Stores  │  Socket.io Client   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST & WebSockets
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Backend Layer (Node.js + Express)             │
│   Rate Limiter  │  JWT Auth Guard  │  Zod Schema Validation │
│   Controllers   │  Matching Logic  │  Socket.io Event Bus   │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│      Prisma ORM (Data)      │ │     Redis 7 (Pub/Sub)       │
│  PostgreSQL 16 Multi-Model  │ │   Session & Event Caching   │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Domain | Technologies & Libraries |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios |
| **State Management** | Zustand (Stateless client-side stores) |
| **Backend** | Node.js (v20+), Express.js, TypeScript |
| **Database & ORM** | PostgreSQL 16, Prisma ORM 6 |
| **Real-Time & Caching** | Socket.IO, Redis 7 (ioredis) |
| **Security & Utilities** | JSON Web Tokens (jsonwebtoken), BCrypt.js, express-rate-limit, Zod |
| **API Documentation** | Swagger / OpenAPI 3.0 (`swagger-ui-express`, `swagger-jsdoc`) |
| **DevOps & Containers** | Docker, Docker Compose, Multi-stage builds |

---

## 📁 Repository Structure

```text
hackMatch/
├── backend/                  # Express + TypeScript REST & WebSocket Server
│   ├── prisma/               # Prisma Database Schema & Migrations
│   │   └── schema.prisma     # Relational models (Users, Teams, Hackathons, Messages)
│   ├── src/
│   │   ├── config/           # DB, Redis, and Swagger configurations
│   │   ├── controllers/      # Request handlers (Auth, Teams, Matches, Ideas)
│   │   ├── middleware/       # JWT Authentication & Rate limiting
│   │   ├── routes/           # API router declarations
│   │   ├── services/         # Algorithmic matching & Socket.io service
│   │   ├── utils/            # Data formatting and helper utilities
│   │   ├── seed.ts           # Automatic database seeder
│   │   └── server.ts         # Server entrypoint and WebSocket initialization
│   ├── .env.example          # Backend environment variable template
│   ├── Dockerfile            # Multi-stage production container
│   ├── package.json          # Backend dependencies and scripts
│   └── tsconfig.json         # TypeScript configuration
├── client/                   # React 19 + TypeScript + Vite Single Page Application
│   ├── src/
│   │   ├── api/              # Axios instance and interceptors
│   │   ├── components/       # Reusable UI components (Cards, Badges, ChatWindow)
│   │   ├── pages/            # Page views (Dashboard, Hackathons, Teams, Profile)
│   │   ├── store/            # Zustand global state (Auth, Notifications)
│   │   ├── types/            # TypeScript interfaces and shared types
│   │   └── utils/            # Matching logic, avatar generator, and socket client
│   ├── .env.example          # Frontend environment variable template
│   ├── Dockerfile            # Nginx production container
│   ├── package.json          # Frontend dependencies and scripts
│   └── vite.config.ts        # Vite build tool configuration
├── docker-compose.yml        # Orchestration for PostgreSQL, Redis, Backend & Client
├── package.json              # Root monorepo manager with concurrent execution
├── .gitignore                # Comprehensive Git ignore rules
├── LICENSE                   # MIT Open-Source License
└── README.md                 # Project documentation (This file)
```

---

## ⚡ Quick Start Guide

You can run HackMatch either using **Docker Compose** (recommended for zero-config setup) or manually via **Node.js**.

### Option A: Running with Docker Compose (Recommended)

Make sure you have [Docker Desktop](https://www.docker.com/) installed and running.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/hackMatch.git
   cd hackMatch
   ```

2. **Start all services:**
   ```bash
   docker compose up --build
   ```

3. **Access the application:**
   - **Frontend App**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)
   - **Interactive Swagger Docs**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

### Option B: Local Manual Setup

#### Prerequisites
- **Node.js**: v18.x or later (v20+ recommended)
- **PostgreSQL**: Running locally on port `5432`
- **Redis**: Running locally on port `6379`

#### 1. Setup Environment Variables

Copy the sample environment files in both folders:

```bash
# In the backend directory
cp backend/.env.example backend/.env

# (Optional) In the client directory
cp client/.env.example client/.env
```

Ensure the `DATABASE_URL` in `backend/.env` points to your PostgreSQL instance:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/hackmatch?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your_custom_jwt_secret_key_make_it_long_and_secure"
```

#### 2. Install Dependencies

From the repository root, install dependencies for the root, backend, and client:
```bash
npm run install-all
```

#### 3. Initialize & Seed the Database

Run Prisma migrations and populate mock data:
```bash
# Push schema to PostgreSQL
npm run db:push

# Generate Prisma client
npm run db:generate

# Populate initial hackathons, mock hackers, and teams
npm run db:seed
```

#### 4. Launch Development Servers

Run both the backend API and Vite client concurrently:
```bash
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173) (or `http://localhost:3000`)
- **Backend API & Swagger**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

## 🔑 Default Test Accounts (From Seeder)

When the database is seeded (`npm run db:seed`), the following accounts are ready to test:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hackmatch.com` | `admin123` | Full access to moderation & admin panel |
| **Full Stack Hacker** | `alex@mit.edu` | `password123` | React, Node.js, TypeScript specialist |
| **AI / ML Hacker** | `sarah@stanford.edu` | `password123` | Python, PyTorch, LangChain specialist |
| **UI/UX Hacker** | `david@berkeley.edu` | `password123` | Figma, Tailwind, Next.js specialist |

---

## 📡 REST API Reference

HackMatch provides a documented RESTful API. Below is a summary of primary endpoints:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new hacker profile | No |
| `POST` | `/api/auth/login` | Authenticate user and receive JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user details | Yes |
| `GET` | `/api/hackathons` | List all hackathons (supports filtering) | No |
| `GET` | `/api/hackathons/:id` | Retrieve hackathon details & teams | No |
| `POST` | `/api/hackathons/:id/interested`| Toggle interest/registration | Yes |
| `GET` | `/api/teams` | List open teams and requirements | No |
| `POST` | `/api/teams` | Create a new hackathon team | Yes |
| `GET` | `/api/match/teammates` | Get smart teammate recommendations | Yes |
| `POST` | `/api/requests/join` | Send request to join an active team | Yes |
| `POST` | `/api/requests/invite` | Invite a user to your team | Yes |
| `GET` | `/api/ideas` | Browse community project ideas | No |
| `POST` | `/api/ideas/:id/upvote`| Upvote a project idea | Yes |
| `GET` | `/api/messages/:teamId`| Retrieve team chat message history | Yes |
| `GET` | `/api/notifications` | Fetch user notification stream | Yes |
| `GET` | `/api/admin/stats` | Access platform metrics | Admin |

> Explore the full interactive request/response schemas at **`/api-docs`** when the server is running.

---

## 🧠 Smart Matching Algorithm Breakdown

The matching engine scores compatibility between a user $U$ and a candidate/team $C$ using a weighted multi-factor heuristic:

1. **Tech Stack & Skill Overlap ($40\%$)**: Jaccard similarity coefficient applied across desired technical competencies and candidate skills.
2. **Experience Level Synergy ($25\%$)**: Balances seniority tiers (Beginner, Intermediate, Advanced) to promote productive team dynamics.
3. **Hackathon Mutual Interest ($25\%$)**: Bonus weighting awarded if both parties are registered for the same upcoming competition.
4. **Community Badges & Verification ($10\%$)**: Verified badges boost candidate profile visibility in match queries.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
