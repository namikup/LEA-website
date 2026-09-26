# LEA Ambassador Ops - UUM Campus Tracker & Website

Comprehensive operational dashboard and tracking platform for LEA University Community Ambassadors at Universiti Utara Malaysia (UUM).

## 🚀 Overview

The **LEA Campus Tracker & Ambassador Ops Dashboard** is designed to streamline campus recruitment, institutional partner outreach (JKP, residential halls, academic clubs), and event coordination.

- **KPI Progress Tracking**: Real-time progress bars for demographic milestones (e.g. Chinese & Malay recruitment targets) and event booth slots.
- **Partners & Outreach Management**: Track engagements across Inasis (residential colleges), faculty clubs, and university societies.
- **Student Pipeline CRM**: Manage leads across stages (`Lead`, `RSVP`, `Attended`, `Onboarded`).
- **Multilingual Outreach Pitch Scripts**: Built-in 1-click copy pitch scripts in Bahasa Melayu, English, and Chinese for club leaders.
- **Backend API**: Node.js & Express server with SQLite database persistence.

---

## 📁 Project Structure

```
├── index.html                                      # Main dashboard application (compatible with GitHub Pages)
├── lea_student_ambassador_progress_dashboard.html  # Standalone standalone tracker template
├── server.js                                       # Express & SQLite backend API
├── package.json                                    # Node dependencies & scripts
└── .gitignore                                      # Ignored database and dependency files
```

---

## 🛠️ Quick Start

### Option 1: Standalone Static Dashboard
You can open `index.html` directly in any web browser, or host via GitHub Pages without setting up a backend.

### Option 2: Full-Stack with Backend API
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open your browser at `http://localhost:3000`.

---

## 📡 API Endpoints

- `GET /api/stats` - Ambassador KPI summary metrics
- `GET /api/partners` - List all student society & institutional partners
- `POST /api/partners` - Register a new campus partner
- `PUT /api/partners/:id` - Update partner status or booth confirmation
- `DELETE /api/partners/:id` - Remove a partner
- `GET /api/recruits` - Retrieve student recruitment leads
- `POST /api/recruits` - Add a recruit lead
- `PUT /api/recruits/:id` - Update recruit pipeline stage
