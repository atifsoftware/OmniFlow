# OmniFlow ⚡
### Enterprise Full-Stack Monorepo Framework

[![CI Pipeline](https://github.com/atifsoftware/OmniFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/atifsoftware/OmniFlow/actions/workflows/ci.yml)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)

**OmniFlow** is a modern, modular, enterprise-grade framework designed for high-scale E-Commerce and ERP systems. Powered by **NestJS** on the backend, **Next.js** for the web storefront and admin dashboard, **React Native (Expo)** for mobile applications, and **TypeScript** across the entire stack.

---

## 🏗️ Architecture

```text
OmniFlow Monorepo
├── apps/
│   ├── backend/        # NestJS API Engine, OmniDB, Queue, Gemini AI (Port :4000)
│   ├── web/            # Next.js Storefront & Admin Portal (Port :3000)
│   └── mobile/         # React Native (Expo) iOS & Android App (Port :8081)
├── packages/
│   ├── shared/         # Shared TypeScript DTOs, Enums, API Endpoints (@omniflow/shared)
│   └── tsconfig/       # Base TypeScript Configurations (@omniflow/tsconfig)
└── cli/                # OmniFlow Interactive CLI 3.0 (node cli/bin/omni.js)
```

---

## 🌟 Tech Stack

| Layer | Technology | Role |
|:---|:---|:---|
| **Backend** | NestJS + TypeScript | Enterprise REST API, Business Logic, OmniDB, Queues |
| **Web & Admin** | Next.js (App Router) + React | SEO-friendly Storefront + Interactive ERP Portal |
| **Mobile** | React Native + Expo | Cross-platform iOS & Android mobile application |
| **Database** | MySQL + Prisma / OmniDB | Relational ACID storage, migrations, and active records |
| **Shared** | `@omniflow/shared` | Common types, DTOs, endpoints, and validation contracts |
| **AI Engine** | Google Gemini (Native HTTPS) | AI Assistant, business analytics, and automation |

---

## ⚡ Framework Features

- **OmniDB & Active Record ORM**: Fluent Knex/Eloquent-style QueryBuilder + BaseModel relationships.
- **Personal Access Tokens**: Sanctum-style API tokens with SHA-256 hashing and granular abilities.
- **Persistent MySQL Queue**: Enterprise background job worker with retries and failure backoff.
- **Intelligent Exception Diagnostics**: Levenshtein typo suggestion and SQL error detection.
- **DB-Sandboxed Test Runner**: Automated test runner executing within MySQL transactions with auto-rollback.
- **OmniContext & Correlated Logging**: Multi-tenant async request context and slow-query auditing.
- **Interactive CLI 3.0 (`npm run omni`)**: 23 commands for database, queue, cache, AI, and full-stack servers.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp apps/backend/.env.example apps/backend/.env
```

### 3. Build Shared & Backend
```bash
npm run build
```

### 4. Run Applications
- **Backend API Server (NestJS):**
  ```bash
  npm run dev:backend    # Runs on http://localhost:4000/api/v1
  ```
- **Web Storefront & Admin (Next.js):**
  ```bash
  npm run dev:web        # Runs on http://localhost:3000
  ```
- **Mobile Application (Expo):**
  ```bash
  npm run dev:mobile     # Runs on http://localhost:8081
  ```

### 5. Interactive CLI
```bash
npm run omni
```

### 6. API Documentation
Swagger UI is automatically available at:
`http://localhost:4000/api/docs`

---

## 📄 License
MIT © 2026 OmniFlow Core Team