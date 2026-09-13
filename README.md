<p align="center">
  <img src="logo.png" alt="OmniFlow Enterprise Logo" width="180" style="border-radius: 28px; box-shadow: 0 12px 35px rgba(230,81,0,0.35);" />
</p>

<h1 align="center">OmniFlow ⚡</h1>
<h3 align="center">Next-Generation Enterprise Full-Stack ERP & E-Commerce Platform</h3>

<p align="center">
  <strong>Unified High-Velocity TypeScript Monorepo: NestJS 10 • Next.js 14 • React Native (Expo) • Dual-Dialect OmniDB</strong>
</p>

<p align="center">
  <a href="https://github.com/atifsoftware/OmniFlow/actions/workflows/ci.yml"><img src="https://github.com/atifsoftware/OmniFlow/actions/workflows/ci.yml/badge.svg" alt="CI Pipeline" /></a>
  <a href="https://nestjs.com/"><img src="https://img.shields.io/badge/NestJS-10.0-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14.2-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
  <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-Expo-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React Native" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/Database-MySQL_%7C_PostgreSQL-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="Database" /></a>
  <a href="http://localhost:4000/api/docs"><img src="https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?style=flat-square&logo=swagger&logoColor=black" alt="Swagger" /></a>
  <a href="https://jestjs.io/"><img src="https://img.shields.io/badge/Tests-49%20passed%20(100%25)-brightgreen.svg?style=flat-square" alt="Tests" /></a>
</p>

---

**OmniFlow** is a modern, modular, enterprise-grade framework designed for high-scale E-Commerce and ERP systems. Built with **NestJS 10** on the backend, **Next.js 14** for the web storefront and AeroMVC-grade admin dashboard, **React Native (Expo)** for mobile applications, and **TypeScript** across the entire stack.

---

## 🌐 Live System Endpoints (Local)

| Service | Port / URL | Description |
|:---|:---|:---|
| 🛍️ **Web Storefront** | [`http://localhost:3000`](http://localhost:3000) | Customer-facing Next.js 14 storefront with rich product presentation |
| 🎛️ **ERP Admin Portal** | [`http://localhost:3000/admin`](http://localhost:3000/admin) | AeroMVC-grade Nursery ERP dashboard, live orders, catalog, users, settings |
| ⚡ **Backend REST API** | [`http://localhost:4000/api/v1`](http://localhost:4000/api/v1) | NestJS 10 non-blocking enterprise API with L2 caching and OmniDB |
| 📖 **Swagger OpenAPI Docs** | [`http://localhost:4000/api/docs`](http://localhost:4000/api/docs) | Interactive API exploration, DTO schemas, and try-it-out console |
| 📱 **Mobile App (Expo)** | [`http://localhost:8081`](http://localhost:8081) | Cross-platform iOS & Android mobile application with Hermes engine |

---

## 🏗️ Architecture

```text
OmniFlow Monorepo
├── apps/
│   ├── backend/        # NestJS API Engine, OmniDB, Queue, Gemini AI, ERP Engines (Port :4000)
│   ├── web/            # Next.js Storefront & Admin Portal (Port :3000)
│   └── mobile/         # React Native (Expo) iOS & Android App (Port :8081)
├── packages/
│   ├── shared/         # Shared TypeScript DTOs, Enums, NumberToWords, Money (@omniflow/shared)
│   └── tsconfig/       # Base TypeScript Configurations (@omniflow/tsconfig)
└── cli/                # OmniFlow Interactive CLI 3.0 (node cli/bin/omni.js)
```

---

## 🌟 Tech Stack

| Layer | Technology | Role |
|:---|:---|:---|
| **Backend** | NestJS + TypeScript | Enterprise REST API, Business Logic, OmniDB, Queues, PDF Engine |
| **Web & Admin** | Next.js (App Router) + React | SEO-friendly Storefront + AeroMVC-grade ERP Portal |
| **Mobile** | React Native + Expo | Cross-platform iOS & Android mobile application |
| **Database** | MySQL & PostgreSQL (Dual-Dialect OmniDB) | Zero-code-change switching, connection pooling, active records, deadlock auto-retry |
| **Shared** | `@omniflow/shared` | Common types, DTOs, NumberToWords, Money, validation contracts |
| **AI Engine** | Google Gemini (Native HTTPS) | AI Assistant, business analytics, and automation |

---

## 🎛️ AeroMVC-Grade ERP Admin Panel (`apps/web/src/app/admin`)

OmniFlow features an enterprise admin dashboard inspired by the robust architecture and design of **AeroMVC**:

- 📊 **Real-Time System Dashboard**:
  - Live digital clock with seconds, date badges, and system health status.
  - 4 Real-time KPI cards: Total Revenue, Total Orders, 12ms Average Latency, and Active OmniDB Connection Pool.
  - Responsive API Traffic and Sales analytics bar chart with monthly/weekly toggles.
  - 6 One-click Quick Actions (Swagger console, live orders, OmniDB pool, cache flush, Gzip backup, system config).
- 🛍️ **Orders & Sales Management** (`/admin/orders`):
  - Paginated orders table with method and status badges.
  - Instant Bengali Unicode PDF invoice generation and download.
- 📦 **Inventory & Product Catalog** (`/admin/catalog`):
  - SKU tracking, stock status filters, and Code128 barcode generation.
- 👥 **Users & Access Control (RBAC)** (`/admin/users`):
  - Filterable user management, role assignments (Admin, Manager, Staff, Customer), and account modals.
- ⚙️ **System Configuration** (`/admin/settings`):
  - Tabbed controls for General, Database Pool, Security & Guards, Cache & Engines, and Branding.
- 🎨 **Visual Excellence**:
  - Deep cyber amber/slate color system (`--adm-primary: #e65100`, `#ff851b`).
  - Seamless Light / Dark mode persistence with localStorage.
  - Dedicated toast notification system for instant feedback.

---

## 🛒 Enterprise E-commerce ERP Core Engines

OmniFlow incorporates 8 battle-tested, mission-critical ERP core engines:

- 📄 **HTML-to-PDF Reporting Engine (`PdfService`)**:
  - **Native Bengali Unicode & Ligatures**: Google Fonts (*Noto Sans Bengali*, *Kalpurush*) and OpenType ligature shaping (`font-feature-settings: "kern" 1, "liga" 1`) ensure complex Bengali conjuncts (*ক্ষ, জ্ঞ, ঙ্গ, ঞ্চ, ষ্ণ*) render flawlessly without broken glyphs.
  - **EJS Template Rendering**: Render dynamic invoices, challans, and bills from EJS views via `pdfService.loadView('reports/invoice', data)`.
  - **Flexible Delivery**: Stream directly to browser download (`pdf.download(res)`), preview inline (`pdf.inline(res)`), export binary buffer (`pdf.toBuffer()`), or save to disk (`pdf.save(path)`).
- 🔤 **Number-to-Words Engine (বাংলা ও ইংরেজি - `@omniflow/shared`)**:
  - Full conversion for ০-৯৯, শত, হাজার, লক্ষ, কোটি and International Million/Billion.
  - Invoice & cheque amount formatting with fractions (`টাকা ও পয়সা মাত্র` / `Taka & Paisa Only`). Available across **Backend**, **Web**, and **Mobile**!
- 💰 **Precision Financial Math (`Money` - `@omniflow/shared`)**:
  - Stores amounts internally as integer sub-units, eliminating floating-point rounding errors (`0.1 + 0.2 === 0.3`).
  - Tax/VAT calculation, discount percentages, and fair-share remainder allocation.
- 💾 **Automated Database Backup & Restore (`BackupService`)**:
  - Pure Node.js streaming SQL dumper with Gzip compression (`.sql.gz`) reducing archive size by 95%.
  - Automatic retention policy and full restoration capabilities via CLI (`db:backup`, `db:backups`, `db:restore`).
- 🔢 **Sequential Document Numbering Engine (`DocNumberService`)**:
  - Monotonic sequential voucher generation for Invoices (`INV-202609-00001`), Delivery Challans, and Receipts.
  - Reset policies (`monthly`, `yearly`, `never`) and atomic concurrency safety.
- 🕵️ **Audit Trail & State Diff Engine (`AuditService`)**:
  - Automatic attribute difference detection capturing changed values only. Full audit history inspection via `getTrail(model, id)`.
- 📊 **Memory-Safe Streaming Export (`ExportService`)**:
  - Row-by-row HTTP streaming for massive datasets (50,000+ orders) with **UTF-8 BOM** for Microsoft Excel native Bengali rendering and CSV Formula Injection protection.
- 🔒 **Pessimistic Row-Level Locking & Deadlock Auto-Retry**:
  - `qb.forUpdate()` and `qb.sharedLock()` in OmniDB QueryBuilder.
  - Automatic transaction deadlock retry (`ER_LOCK_DEADLOCK` / 1213) with exponential backoff.

---

## 🗄️ Native Dual-Database Support: MySQL & PostgreSQL

OmniFlow features an enterprise-grade **Dual-Dialect Database Engine** (`OmniDbService`, `QueryBuilder`, `BackupService`). Developers write application queries and models once, and OmniFlow translates queries, parameter placeholders, quotes, and locking mechanisms on the fly without any code changes.

### Switching Databases via `.env`

#### Option A: MySQL
```env
DB_TYPE=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASS=secret
DB_NAME=omniflow_db
```

#### Option B: PostgreSQL
```env
DB_TYPE=postgresql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASS=secret
DB_NAME=omniflow_db
# Or full connection URL:
# DATABASE_URL=postgres://postgres:secret@localhost:5432/omniflow_db
```

### Dual-Database Capabilities

| Feature | MySQL | PostgreSQL |
|:---|:---|:---|
| **Identifier Quoting** | Backticks (``` `table`.`col` ```) | Standard ANSI double quotes (``` "table"."col" ```) |
| **Placeholders** | Positional `?` | Dollar indexed (`$1, $2, $3`) |
| **Insert Return ID** | `result.insertId` | Appends `RETURNING id` -> `rows[0].id` |
| **Shared Row Lock** | `LOCK IN SHARE MODE` | `FOR SHARE` |
| **Exclusive Row Lock** | `FOR UPDATE` | `FOR UPDATE` |
| **Auto Deadlock Retry** | Error codes `1213` & `1205` | Error codes `40P01` & `55P03` (Exponential backoff) |
| **Zero-Config Backup** | Dumps `mysqldump` / SQL DDL + rows | Dumps `pg_dump` / PostgreSQL SQL DDL + rows |

---

## 🧪 Running Tests

OmniFlow includes **49 automated Jest test suites** (100% passing):

```bash
npm --prefix apps/backend run test
```

```text
PASS src/core/cache/omni-cache.service.spec.ts
PASS src/core/__tests__/erp-advanced-modules.spec.ts
PASS src/modules/catalog/catalog.service.spec.ts
PASS src/modules/orders/orders.service.spec.ts
PASS src/modules/auth/auth.service.spec.ts

Test Suites: 5 passed, 5 total
Tests:       49 passed, 49 total (100%)
```

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

### 4. Run Applications Locally
- **Backend API Server (NestJS):**
  ```bash
  npm run dev:backend    # Runs on http://localhost:4000/api/v1 (Swagger: /api/docs)
  ```
- **Web Storefront & Admin Portal (Next.js):**
  ```bash
  npm run dev:web        # Runs on http://localhost:3000 (Admin: /admin)
  ```
- **Mobile Application (Expo):**
  ```bash
  npm run dev:mobile     # Runs on http://localhost:8081
  ```

### 5. Production Cluster Deployment
Run the backend across all CPU cores using PM2 clustering with automatic failover and HTTP compression:
```bash
npm run build
npm run start:cluster    # Spawns PM2 workers on all CPU cores
npm run stop:cluster     # Gracefully stop cluster
npm run restart:cluster  # Zero-downtime cluster reload
```

### 6. Interactive CLI
```bash
npm run omni
```

---

## 📄 License
MIT © 2026 [OmniFlow Core Team](https://github.com/atifsoftware/OmniFlow)
