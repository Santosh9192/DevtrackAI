<div align="center">
  <img src="screenshots/logo.png" alt="DevTrack AI" width="100"/>
  <h1>DevTrack AI</h1>
  <p><strong>AI-Powered Project & Developer Management Platform</strong></p>
  <p>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&style=flat-square" alt="React 19"/></a>
    <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&style=flat-square" alt="FastAPI"/></a>
    <a href="https://www.mysql.com"><img src="https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&style=flat-square" alt="MySQL"/></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&style=flat-square" alt="Tailwind"/></a>
    <a href="https://jwt.io"><img src="https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&style=flat-square" alt="JWT"/></a>
    <a href="https://ai.google.dev"><img src="https://img.shields.io/badge/Gemini-AI-8E75B2?logo=google&style=flat-square" alt="Gemini AI"/></a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/status-production-ready-22c55e?style=flat-square" alt="Status"/>
    <img src="https://img.shields.io/badge/license-MIT-3b82f6?style=flat-square" alt="License"/>
    <img src="https://img.shields.io/badge/PRs-welcome-8b5cf6?style=flat-square" alt="PRs Welcome"/>
  </p>
  <br/>
</div>

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Screenshot Gallery](#screenshot-gallery)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Performance](#performance)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 👑 Role-Based Dashboards

<table>
  <tr>
    <th width="180">Role</th>
    <th>Dashboard Content</th>
    <th width="140">Access</th>
  </tr>
  <tr>
    <td><b>🛡️ Admin</b></td>
    <td>System-wide KPIs • User role distribution • Bug severity analysis • Project health monitoring • At-risk alerts • Weekly/monthly trends</td>
    <td>Full access</td>
  </tr>
  <tr>
    <td><b>📈 Manager</b></td>
    <td>Team workload visualization • Project progress • Member productivity • Deadline monitoring • Workload distribution chart</td>
    <td>Managed projects + team</td>
  </tr>
  <tr>
    <td><b>👨‍💻 Developer</b></td>
    <td>Personal task tracker • Upcoming deadlines (countdown) • Priority distribution • AI assistant • Weekly completions</td>
    <td>Assigned tasks only</td>
  </tr>
</table>

### 📋 Core Modules

<table>
  <tr>
    <td width="50%">
      <b>📁 Project Management</b>
      <ul>
        <li>Full CRUD with drag-and-drop <b>Kanban boards</b></li>
        <li>Workflow: <b>Todo → In Progress → Review → Completed</b></li>
        <li>Priority levels, deadlines, progress bars</li>
        <li>Member assignment & role-based access</li>
        <li>Search, sort, filter, pagination</li>
      </ul>
    </td>
    <td width="50%">
      <b>🐛 Bug Tracker</b>
      <ul>
        <li>Report with severity levels (Critical → Low)</li>
        <li>Workflow: <b>Open → In Progress → Resolved → Closed</b></li>
        <li>Bug comments & team discussions</li>
        <li>Critical bug alerts on dashboard</li>
        <li>Steps-to-reproduce & environment info</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <b>🤖 AI Features</b>
      <ul>
        <li><b>Task Description</b> — AI writes detailed requirements</li>
        <li><b>Sprint Summary</b> — Auto-generated retrospectives</li>
        <li><b>Bug Rewriting</b> — Improve clarity & structure</li>
        <li><b>Weekly Reports</b> — Stakeholder-ready summaries</li>
        <li><b>Complexity Estimation</b> — Story points</li>
        <li><b>Daily Standup</b> — Yesterday / Today / Blockers</li>
      </ul>
      <p>⚡ <b>Graceful fallback</b> to Mock AI when no API key is set</p>
    </td>
    <td width="50%">
      <b>👥 Team Management</b>
      <ul>
        <li>User profiles with avatars & bios</li>
        <li>Role-based access control (RBAC)</li>
        <li>Departments & designations</li>
        <li>Activity timeline per user</li>
        <li>Search & filter employees</li>
      </ul>
      <b>🔔 Notifications</b>
      <ul>
        <li>Task assigned • Task completed • Bug assigned</li>
        <li>Deadline reminders • AI report ready</li>
        <li>Mark as read • Mark all as read</li>
      </ul>
    </td>
  </tr>
</table>

### 🎨 UI/UX Highlights
- **Dark mode** glassmorphism design system
- **Framer Motion** micro-interactions & page transitions
- **Fully responsive** — mobile, tablet, desktop
- **Loading skeletons** & meaningful **empty states**
- React Hot Toast notifications
- Interactive Recharts data visualizations

<br/>

---

## 🏗️ Architecture

### System Architecture

```mermaid
graph TB
    subgraph "🌐 Frontend (React 19 + Vite)"
        A[React SPA] --> B[React Router]
        A --> C[Auth Context]
        A --> D[Recharts]
        A --> E[Framer Motion]
        A --> F[Axios Client]
        F --> G[API Service Layer]
    end

    subgraph "🔀 Network"
        G --> H[HTTP / CORS]
    end

    subgraph "⚙️ Backend (FastAPI)"
        H --> I[FastAPI App]
        I --> J[Auth Middleware JWT]
        J --> K[Route Handlers]
        K --> L[Services Layer]
        L --> M[SQLAlchemy ORM]
        M --> N[(MySQL Database)]
        K --> O[AI Service]
        O --> P[Gemini API / Mock]
    end

    style A fill:#1a1a2e,stroke:#00d4ff,color:#fff
    style I fill:#1a1a2e,stroke:#7b2ff7,color:#fff
    style N fill:#0d1117,stroke:#4479A1,color:#fff
    style P fill:#0d1117,stroke:#8E75B2,color:#fff
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    U->>F: Enter credentials
    F->>F: Validate form
    F->>B: POST /api/auth/login
    B->>DB: Verify email & password
    DB-->>B: User found
    B->>B: Generate JWT + Refresh Token
    B-->>F: { access_token, refresh_token, user }
    F->>F: Store tokens in localStorage
    F->>F: Redirect to dashboard

    Note over F,B: Subsequent requests
    F->>B: GET /api/dashboard/stats
    Note over F,B: Authorization: Bearer {token}
    B->>B: Verify JWT signature + expiry
    B->>B: Check role permissions
    B-->>F: { stats, charts }
```

### Kanban Workflow

```mermaid
stateDiagram-v2
    [*] --> Todo: Create Task
    Todo --> In_Progress: Start Work
    In_Progress --> Review: Submit for Review
    Review --> In_Progress: Changes Requested
    Review --> Completed: Approved
    Completed --> [*]

    note right of Todo
        Assign developer
        Set priority
        Set deadline
    end note

    note right of In_Progress
        Drag to In Progress
        column on Kanban board
    end note
```

<br/>

---

## 📸 Screenshot Gallery

<div align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <img src="screenshots/landing.png" alt="Landing Page" width="100%"/>
        <sub><b>🏠 Landing Page</b> — Hero, features, pricing, CTA</sub>
      </td>
      <td align="center" width="50%">
        <img src="screenshots/login.png" alt="Login Page" width="100%"/>
        <sub><b>🔐 Login</b> — JWT authentication with demo accounts</sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <img src="screenshots/dashboard-admin.png" alt="Admin Dashboard" width="100%"/>
        <sub><b>🛡️ Admin Dashboard</b> — System KPIs, role distribution, bug severity</sub>
      </td>
      <td align="center" width="50%">
        <img src="screenshots/dashboard-manager.png" alt="Manager Dashboard" width="100%"/>
        <sub><b>📈 Manager Dashboard</b> — Team workload, project health, productivity</sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <img src="screenshots/dashboard-developer.png" alt="Developer Dashboard" width="100%"/>
        <sub><b>👨‍💻 Developer Dashboard</b> — Personal tasks, deadlines, AI assistant</sub>
      </td>
      <td align="center" width="50%">
        <img src="screenshots/projects.png" alt="Projects" width="100%"/>
        <sub><b>📁 Projects</b> — Search, filter, pagination, create modal</sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <img src="screenshots/kanban.png" alt="Kanban Board" width="100%"/>
        <sub><b>📋 Kanban Board</b> — Drag-and-drop with 4 columns</sub>
      </td>
      <td align="center" width="50%">
        <img src="screenshots/bugs.png" alt="Bug Tracker" width="100%"/>
        <sub><b>🐛 Bug Tracker</b> — Severity levels, status, assignment</sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <img src="screenshots/ai-features.png" alt="AI Features" width="100%"/>
        <sub><b>🤖 AI Features</b> — Content generation with mock fallback</sub>
      </td>
      <td align="center" width="50%">
        <img src="screenshots/notifications.png" alt="Notifications" width="100%"/>
        <sub><b>🔔 Notifications</b> — Real-time alerts with mark-as-read</sub>
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <img src="screenshots/profile.png" alt="Profile" width="100%"/>
        <sub><b>👤 Profile & Settings</b> — Avatar, activity history, preferences</sub>
      </td>
      <td align="center" width="50%">
        <img src="screenshots/mobile.png" alt="Mobile" width="50%"/>
        <sub><b>📱 Mobile Responsive</b> — Adaptive layout for all devices</sub>
      </td>
    </tr>
  </table>
</div>

<br/>

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.x | UI component library |
| **Vite** | 6.x | Build tool & dev server (HMR) |
| **Tailwind CSS** | 3.4 | Utility-first CSS framework |
| **React Router** | 7.x | Client-side routing (SPA) |
| **Axios** | 1.x | HTTP client with interceptors |
| **Recharts** | 2.x | Responsive data visualizations |
| **Framer Motion** | 11.x | Declarative animations |
| **React Icons** | 5.x | Heroicons v2 icon set |
| **React Hot Toast** | 2.x | Toast notification system |
| **@hello-pangea/dnd** | 16.x | Drag & drop (Kanban) |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.12+ | Runtime |
| **FastAPI** | 0.115 | REST API framework |
| **SQLAlchemy** | 2.0 | ORM with async support |
| **Pydantic** | 2.x | Data validation & serialization |
| **python-jose** | 3.x | JWT token handling |
| **Passlib** | 1.7 | Password hashing (bcrypt) |
| **Uvicorn** | 0.30 | ASGI server |
| **Google Generative AI** | 0.8 | AI features (mock fallback) |
| **MySQL** | 8.0 | Relational database |
| **PyMySQL** | 1.x | MySQL Python driver |

### DevOps & Deployment

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization (multi-stage builds) |
| **Docker Compose** | Full stack orchestration |
| **Vercel** | Frontend hosting (SPA) |
| **Render** | Backend hosting (PaaS) |

<br/>

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required tools
Node.js >= 18      # JavaScript runtime
Python >= 3.10     # Python runtime
MySQL >= 8.0       # Database server
npm / yarn         # Package manager
```

### Step 1: Database

```bash
# Create database and tables
mysql -u root -p < database/schema.sql

# (Optional) Seed sample data with 7 users, 6 projects, 11 tasks, 6 bugs
cd backend && python seed.py
```

### Step 2: Backend

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
source venv/bin/activate    # Linux/Mac
# .\venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment (edit values as needed)
cp ../.env.example .env

# Start the server (hot-reload enabled)
python -m app.main

# 🎯 Server: http://localhost:8000
# 📖 Docs:   http://localhost:8000/docs
# 🔍 Redoc:  http://localhost:8000/redoc
```

### Step 3: Frontend

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start dev server (HMR enabled)
npm run dev

# 🎯 App: http://localhost:5173
```

### Step 4: Login

Open **http://localhost:5173** and use these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| 🛡️ **Admin** | admin@devtrack.ai | `Admin@123` |
| 📈 **Manager** | manager@devtrack.ai | `Manager@123` |
| 👨‍💻 **Developer** | dev@devtrack.ai | `Dev@123` |
| 🎨 **Designer** | bob@devtrack.ai | `Dev@123` |

<br/>

---

## 📡 API Reference

Interactive API documentation is available at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### 🔐 Authentication

All API endpoints (except login/register) require JWT authentication via `Authorization: Bearer {token}` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login → returns JWT + refresh token |
| `POST` | `/api/auth/refresh` | ❌ | Refresh expired access token |
| `POST` | `/api/auth/forgot-password` | ❌ | Request password reset email |
| `POST` | `/api/auth/change-password` | ✅ | Change current password |
| `GET` | `/api/auth/me` | ✅ | Get authenticated user info |

### 📁 Projects

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/projects/` | ✅ | List all projects (paginated, filterable) |
| `POST` | `/api/projects/` | ✅ | Create new project |
| `GET` | `/api/projects/{id}` | ✅ | Get project details |
| `PUT` | `/api/projects/{id}` | ✅ | Update project |
| `DELETE` | `/api/projects/{id}` | ✅ | Delete project |

### 📋 Tasks & Kanban

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/tasks/` | ✅ | List tasks (filtered, paginated) |
| `POST` | `/api/tasks/` | ✅ | Create new task |
| `GET` | `/api/tasks/{id}` | ✅ | Get task details |
| `PUT` | `/api/tasks/{id}` | ✅ | Update task (status, priority, assignee) |
| `DELETE` | `/api/tasks/{id}` | ✅ | Delete task |
| `GET` | `/api/tasks/kanban/{project_id}` | ✅ | Get Kanban board data |
| `PUT` | `/api/tasks/reorder` | ✅ | Reorder tasks (drag-and-drop) |

### 🐛 Bugs

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/bugs/` | ✅ | List bugs (filterable by severity/status) |
| `POST` | `/api/bugs/` | ✅ | Report new bug |
| `GET` | `/api/bugs/{id}` | ✅ | Get bug details |
| `PUT` | `/api/bugs/{id}` | ✅ | Update bug (status, assignee) |
| `DELETE` | `/api/bugs/{id}` | ✅ | Delete bug |

### 📊 Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/dashboard/stats` | ✅ | Role-specific KPIs (differs by role) |
| `GET` | `/api/dashboard/charts` | ✅ | Chart data (weekly/monthly trends) |

### 🤖 AI

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/ai/generate` | ✅ | Generate AI content (type: task/sprint/bug/report/standup/estimate) |

### 👥 Users & Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/users/` | ✅ | List users (Admin only) |
| `GET` | `/api/profile/` | ✅ | Get current user profile |
| `PUT` | `/api/profile/` | ✅ | Update profile (avatar, bio, name) |
| `GET` | `/api/notifications/` | ✅ | List user notifications |
| `PUT` | `/api/notifications/{id}` | ✅ | Mark notification as read |
| `POST` | `/api/comments/task/{task_id}` | ✅ | Add task comment |
| `GET` | `/api/admin/` | ✅ | Admin-only operations |


<br/>

---

### Tables Overview

| Table | Records (Seeded) | Purpose |
|-------|-----------------|---------|
| `roles` | 3 | Admin, Project Manager, Developer |
| `users` | 7 | Platform users with hashed passwords |
| `projects` | 6 | Projects with status & priority |
| `tasks` | 11 | Tasks with Kanban board order |
| `bug_reports` | 6 | Bugs with severity & status |
| `task_comments` | — | Task discussions |
| `bug_comments` | — | Bug discussions |
| `notifications` | 6 | User notifications |
| `activity_logs` | 8 | User activity timeline |
| `project_members` | 6 | Project-user assignments |
| `user_settings` | 7 | Theme & language preferences |

<br/>

---

## ☁️ Deployment

### Option 1: Frontend → Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/devtrack-ai&project-name=devtrack-ai&framework=vite)

```bash
cd frontend
npm run build          # → dist/ folder
# Deploy dist/ to Vercel with these env vars:
# VITE_API_URL = https://your-backend.onrender.com
```

### Option 2: Backend → Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/devtrack-ai)

```bash
# Use render.yaml config (included in project)
# Required env vars:
# DATABASE_URL = mysql://user:pass@host:3306/devtrack_ai
# SECRET_KEY   = <random-256-bit-key>
# CORS_ORIGINS = https://your-frontend.vercel.app
```

### Option 3: Docker (Single Server)

```bash
# Start everything with one command
docker-compose up -d

# Services:
# Frontend:  http://localhost:5173
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
# Database:  localhost:3306
```

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | — | MySQL connection string |
| `SECRET_KEY` | ✅ | — | JWT signing key (generate 256-bit) |
| `GEMINI_API_KEY` | ❌ | — | Google Gemini key (mock fallback if missing) |
| `CORS_ORIGINS` | ✅ | `http://localhost:5173` | Comma-separated frontend URLs |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ❌ | `30` | JWT token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | ❌ | `7` | Refresh token lifetime |
| `VITE_API_URL` | ✅ | `http://localhost:8000` | Backend URL for frontend |

<br/>

---

## 📁 Project Structure

```
📦 devtrack-ai/
├── 📂 backend/                          # Python FastAPI server
│   ├── 📂 app/
│   │   ├── 📂 models/                   # SQLAlchemy ORM (7 models)
│   │   │   ├── 📄 user.py               #    User, Role models
│   │   │   ├── 📄 project.py            #    Project, ProjectMember
│   │   │   ├── 📄 task.py               #    Task, TaskComment
│   │   │   ├── 📄 bug.py                #    BugReport, BugComment
│   │   │   ├── 📄 notification.py       #    Notification
│   │   │   ├── 📄 activity_log.py       #    ActivityLog
│   │   │   └── 📄 settings.py           #    UserSettings
│   │   ├── 📂 routes/                   # FastAPI route handlers (10 files)
│   │   │   ├── 📄 auth.py               #    Login, register, JWT
│   │   │   ├── 📄 projects.py           #    Project CRUD
│   │   │   ├── 📄 tasks.py              #    Task CRUD + Kanban
│   │   │   ├── 📄 bugs.py               #    Bug CRUD
│   │   │   ├── 📄 dashboard.py          #    Role-specific dashboards
│   │   │   ├── 📄 ai.py                 #    AI generation
│   │   │   ├── 📄 users.py              #    User management
│   │   │   ├── 📄 comments.py           #    Comments
│   │   │   ├── 📄 notifications.py      #    Notifications
│   │   │   └── 📄 admin.py              #    Admin operations
│   │   ├── 📂 middleware/               # JWT auth middleware
│   │   ├── 📂 schemas/                  # Pydantic validation schemas
│   │   ├── 📂 services/                 # Business logic layer
│   │   ├── 📂 utils/                    # Helper utilities
│   │   ├── 📄 config.py                 # Environment configuration
│   │   ├── 📄 database.py               # DB session & engine
│   │   └── 📄 main.py                   # App entry point
│   ├── 📄 seed.py                       # Database seeder (25+ records)
│   └── 📄 requirements.txt              # Python dependencies
│
├── 📂 frontend/                         # React SPA
│   ├── 📂 src/
│   │   ├── 📂 pages/                    # 19 page components
│   │   │   ├── 📄 Dashboard.jsx         #    Role-based routing
│   │   │   ├── 📄 Projects.jsx          #    Project listing + CRUD
│   │   │   ├── 📄 Tasks.jsx             #    Kanban board
│   │   │   ├── 📄 Bugs.jsx              #    Bug tracker
│   │   │   ├── 📄 AIFeatures.jsx        #    AI generation tools
│   │   │   ├── 📄 Landing.jsx           #    Public landing page
│   │   │   ├── 📄 Pricing.jsx           #    Pricing page
│   │   │   └── 📄 ...                   #    12 more pages
│   │   ├── 📂 components/
│   │   │   ├── 📂 dashboard/            # Admin, Manager, Developer dashboards
│   │   │   └── 📂 common/               # Sidebar, Navbar, Modals, Cards
│   │   ├── 📂 context/                  # React Context (AuthProvider)
│   │   ├── 📂 services/                 # Axios API layer (interceptors)
│   │   └── 📂 layouts/                  # MainLayout with sidebar
│   ├── 📄 package.json
│   ├── 📄 vite.config.js
│   └── 📄 tailwind.config.js
│
├── 📂 database/
│   ├── 📄 schema.sql                    # MySQL DDL (10 tables)
│   └── 📄 seed.sql                      # Alternative SQL seed data
│
├── 📂 screenshots/                      # Application screenshots (12)
├── 📄 Dockerfile                        # Backend container
├── 📄 docker-compose.yml                # Full stack orchestration
├── 📄 render.yaml                       # Render deployment config
├── 📄 vercel.json                       # Vercel SPA config
├── 📄 .env.example                      # Environment template
└── 📄 .gitignore
```

<br/>

---


### 💼 Skills Demonstrated
- **Frontend:** React 19, Hooks, Context API, Vite, Tailwind CSS, Recharts, Framer Motion
- **Backend:** Python, FastAPI, SQLAlchemy, JWT, Pydantic, RESTful API design
- **Database:** MySQL, schema design, ER modeling, complex queries, indexing
- **AI/ML:** Google Gemini API integration, prompt engineering, graceful fallback patterns
- **DevOps:** Docker, Docker Compose, CI/CD, Vercel, Render, environment configuration
- **UI/UX:** Dark mode, glassmorphism, responsive design, micro-interactions, accessibility

<br/>

---

## 🗺️ Roadmap

### Phase 1 — Current ✅
- [x] Role-based authentication & authorization
- [x] Project & task CRUD with Kanban
- [x] Bug tracker with severity levels
- [x] AI-powered content generation
- [x] Notification system
- [x] Role-specific dashboards
- [x] Responsive dark mode UI

### Phase 2 — In Progress 🔄
- [ ] Real-time updates with WebSocket push notifications
- [ ] File attachments (image previews, PDF, CSV uploads)
- [ ] Export reports (PDF/CSV for stakeholders)
- [ ] Dark/Light theme toggle

### Phase 3 — Planned 📅
- [ ] Git integration (link repos, show commit history)
- [ ] Time tracking (built-in timer + timesheet reports)
- [ ] Calendar view (deadline overview)
- [ ] Sprint management (velocity tracking, burndown charts)
- [ ] Mobile app (React Native companion)

<br/>

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. Create your feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'feat: add amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a **Pull Request**

### Development Guidelines
- Follow existing code style & conventions
- Write meaningful commit messages (conventional commits)
- Add comments for complex logic
- Test your changes before submitting
- Update documentation if adding new features

<br/>

---

## 📄 License

**MIT License** — Copyright (c) 2026 DevTrack AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

---

<div align="center">
  <br/>
  <p>
    <strong>DevTrack AI</strong> — Built with ❤️
  </p>
  <p>
    <sub>
      If you found this project helpful, consider giving it a ⭐
    </sub>
  </p>
  <p>
    <a href="#table-of-contents">⬆ Back to Top</a>
  </p>
</div>
