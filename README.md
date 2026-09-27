# 🎓 LEA Ambassador Hub - UUM Chapter

[![Live Dashboard](https://img.shields.io/badge/Live%20Site-GitHub%20Pages-2ea44f?style=flat-square&logo=github)](https://namikup.github.io/LEA-website/)
[![Cloud API](https://img.shields.io/badge/Render-API%20Live-46E3B7?style=flat-square&logo=render)](https://lea-website.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-SQLite3-003B57?style=flat-square&logo=sqlite)](https://www.sqlite.org/)

An operational dashboard and recruitment management CRM designed for **LEA University Community Ambassadors** at **Universiti Utara Malaysia (UUM)**. This platform streamlines campus outreach, institutional partnership negotiations, event booth allocation, and demographic recruitment tracking.

---

## 🔗 Live Deployments

- **Frontend Dashboard (GitHub Pages)**: [https://namikup.github.io/LEA-website/](https://namikup.github.io/LEA-website/)
- **Backend API (Render Cloud)**: [https://lea-website.onrender.com](https://lea-website.onrender.com)

---

## 🎯 Mission & Objectives

The LEA Ambassador Hub is built to address key operational challenges in university ambassador campaigns:
1. **Balanced Demographic Milestones**: Real-time ratio tracking across Chinese, Malay, and other student communities to ensure diverse and inclusive campus participation.
2. **Partnership Pipeline Acceleration**: Systematic relationship management with student residential colleges (INASIS), faculty clubs, and university societies to secure free engagement booths.
3. **Structured Lead Conversion**: Clear tracking of prospective members from first touchpoint to active onboarding.
4. **Frictionless Outreach**: Equipping ambassadors with localized, battle-tested pitch templates in Bahasa Melayu, English, and Mandarin.

---

## ✨ Key Features

### 📊 Real-Time KPI & Demographic Analytics
- **Live Milestone Progress**: Visual progress gauges tracking recruits against target quotas.
- **Demographic Breakdown**: Instant calculation of community distribution percentages (Chinese, Malay, Indian / Other).
- **Funnel Conversion Rate**: Automated conversion telemetry (`Lead` ➔ `RSVP-ed` ➔ `Attended` ➔ `Joined LEA`).
- **Booth Pipeline Summary**: Live counters for secured free booths and active negotiations.

### 🤝 Campus Partnership Kanban CRM
- **5-Stage Visual Workflow**: `Not Contacted` ➔ `Pitch Sent` ➔ `Negotiating Booth` ➔ `Secured Free Booth 🎉` ➔ `Declined`.
- **Categorization Filters**: Segment entities by **INASIS JKP**, **Academic / MPP**, **State Club**, and **Cultural Society**.
- **Quick-Advance Controls**: Move partnership stages directly with 1-click select menus.
- **PIC & Notes Management**: Record liaison contacts, WhatsApp handles, and negotiation requirements.

### 👥 Student Recruitment Pipeline
- **Lead Intake CRM**: Track student names, faculty affiliations (SEFB, SOC, SQS, TISSA, SBM), residential colleges (INASIS), and referral channels.
- **Dynamic Search & Filtering**: Fast multi-field filtering by ethnicity and keyword search across names and notes.
- **Stage Progression**: Track progress through `Lead`, `RSVP-ed`, `Attended`, `Joined LEA ⭐`, and `Cold`.

### 💬 1-Click Multilingual Outreach Pitch Scripts
- **Localized Copy Templates**: Culturally tailored proposal messages in **Bahasa Melayu**, **English**, and **Mandarin**.
- **One-Click Clipboard**: Instant copy with subtle on-screen toast confirmation for rapid outreach via WhatsApp and Telegram.

### ⚡ Dual-Mode Data Architecture (Cloud + Offline Fallback)
- **Cloud Mode**: Synchronizes live data with the Express & SQLite REST API hosted on Render (`ambassador.db`).
- **Offline / Static Mode**: Automatically falls back to browser `localStorage` when offline or without internet access, ensuring the dashboard never fails.
- **Live Status Indicator**: Dedicated header badge displaying `🟢 Render API Connected` or `⚪ LocalStorage Mode`.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, Tailwind CSS, FontAwesome 6, Vanilla JavaScript (ES6+) |
| **Backend** | Node.js, Express.js, CORS |
| **Database** | SQLite3 (`ambassador.db`) |
| **Hosting & Cloud** | GitHub Pages (Frontend), Render (Cloud REST API) |

---

## 🏫 UUM Campus Entity Coverage

The dashboard comes pre-seeded with real UUM entities and organizations:

- **Residential Colleges (INASIS)**: TNB, MAS, Tradewinds, Proton, Petronas, Maybank, Sime Darby, and more.
- **Academic Societies & MPP**: QUEST (Quantitative Science), ECOSOC (Economics), COMSAT (Computing), MPP COB Representatives.
- **State Student Bodies**: PERMADA (Kelab Mahasiswa Kedah), IKMAM (Melaka), SEPERAK (Perak).
- **Cultural Organizations**: Pesta Angpau UUM (UUMPAC), Chinese Cultural Club (CCC).

---

## 📁 Project Structure

```
├── index.html         # Single-page dashboard application (GitHub Pages compatible)
├── server.js          # Express.js REST API with SQLite integration
├── package.json       # Node.js project manifest & scripts
├── package-lock.json  # Locked dependency tree
├── ambassador.db      # SQLite database file (auto-created on first run)
├── .gitignore         # Git ignore rules for node_modules and local DBs
└── README.md          # Project documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0 or higher)
- npm (comes bundled with Node.js)

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/namikup/LEA-website.git
   cd LEA-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

5. **Sign In**:
   Copy `.env.example` to `.env` and set your credentials:
   ```bash
   cp .env.example .env
   ```
   Sign in using the `ADMIN_USERNAME` and `ADMIN_PASSWORD` configured in your `.env` file (e.g. `admin`).

> **Note**: For development with automatic server restarts upon file changes, run:
> ```bash
> npm run dev
> ```

---

## 🔐 Authentication & Environment Configuration

The dashboard uses server-side authentication. Passwords are **never stored in the frontend codebase** or committed to GitHub:

| Role | Username Variable | Password Variable | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **Lead Ambassador / Admin** | `ADMIN_USERNAME` (default: `admin`) | `ADMIN_PASSWORD` | **Full Master Access**: Manage all pipelines, demographic KPIs, and database reset permissions (`👑 Lead`). |
| **Campus Ambassador** | `AMBASSADOR_USERNAME` (default: `ambassador`) | `AMBASSADOR_PASSWORD` | **Operational Access**: Add/update recruitment leads, manage partner Kanban stages, and copy outreach pitches. Destructive reset actions are locked for safety (`👤 Ambassador`). |

### Setting Passwords on Render:
1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Select your `lea-website` service.
3. Click **Environment** in the left sidebar.
4. Add `ADMIN_PASSWORD` with your private secret password.
5. Save changes — Render will automatically re-deploy securely.

---

## 📡 API Reference

The backend exposes a clean RESTful API:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/login` | Authenticate ambassador credentials and receive session payload |
| `GET` | `/api/stats` | Retrieve aggregate metrics (total recruits, demographic counts, secured booths) |
| `GET` | `/api/partners` | List all registered campus partners and outreach records |
| `POST` | `/api/partners` | Add a new partner or student society |
| `PUT` | `/api/partners/:id` | Update partner details, status, or booth confirmation |
| `DELETE` | `/api/partners/:id` | Remove a partner from the database |
| `GET` | `/api/recruits` | Retrieve all student recruitment leads |
| `POST` | `/api/recruits` | Register a new student recruit lead |
| `PUT` | `/api/recruits/:id` | Update recruit pipeline stage, notes, or contact info |
| `DELETE` | `/api/recruits/:id` | Delete a student lead record |
| `POST` | `/api/reset` | Restore the database to default pre-seeded UUM template data |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
