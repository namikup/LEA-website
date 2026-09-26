const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize SQLite Database
const db = new sqlite3.Database(path.join(__dirname, 'ambassador.db'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database (ambassador.db)');
    }
});

// Create tables if they do not exist
db.serialize(() => {
    // Table 1: Partners & Campus Entities (JKP, Clubs, Societies)
    db.run(`
    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      status TEXT DEFAULT 'Not Contacted',
      booth_status TEXT DEFAULT 'Pending',
      notes TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Table 2: Student Recruits & Leads
    db.run(`
    CREATE TABLE IF NOT EXISTS recruits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ethnicity TEXT NOT NULL,
      faculty TEXT,
      year INTEGER,
      phone TEXT,
      stage TEXT DEFAULT 'Lead',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// ==========================================
// PARTNER / OUTREACH ROUTES
// ==========================================

// Get all partners
app.get('/api/partners', (req, res) => {
    db.all('SELECT * FROM partners ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add a new partner
app.post('/api/partners', (req, res) => {
    const { name, type, contact_person, phone, status, booth_status, notes } = req.body;
    const sql = `
    INSERT INTO partners (name, type, contact_person, phone, status, booth_status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
    db.run(sql, [name, type, contact_person, phone, status || 'Not Contacted', booth_status || 'Pending', notes], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, ...req.body });
    });
});

// Update partner status or details
app.put('/api/partners/:id', (req, res) => {
    const { id } = req.params;
    const { status, booth_status, notes, contact_person, phone } = req.body;
    const sql = `
    UPDATE partners 
    SET status = COALESCE(?, status),
        booth_status = COALESCE(?, booth_status),
        notes = COALESCE(?, notes),
        contact_person = COALESCE(?, contact_person),
        phone = COALESCE(?, phone),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
    db.run(sql, [status, booth_status, notes, contact_person, phone, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Partner updated successfully', changes: this.changes });
    });
});

// Delete partner
app.delete('/api/partners/:id', (req, res) => {
    db.run('DELETE FROM partners WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Partner deleted', changes: this.changes });
    });
});

// ==========================================
// STUDENT RECRUITMENT ROUTES
// ==========================================

// Get all recruits
app.get('/api/recruits', (req, res) => {
    db.all('SELECT * FROM recruits ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Add a recruit lead
app.post('/api/recruits', (req, res) => {
    const { name, ethnicity, faculty, year, phone, stage, notes } = req.body;
    const sql = `
    INSERT INTO recruits (name, ethnicity, faculty, year, phone, stage, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
    db.run(sql, [name, ethnicity, faculty, year, phone, stage || 'Lead', notes], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, ...req.body });
    });
});

// Update recruit pipeline stage (e.g., Lead -> RSVP -> Attended -> Onboarded)
app.put('/api/recruits/:id', (req, res) => {
    const { id } = req.params;
    const { stage, notes } = req.body;
    const sql = `
    UPDATE recruits 
    SET stage = COALESCE(?, stage),
        notes = COALESCE(?, notes)
    WHERE id = ?
  `;
    db.run(sql, [stage, notes, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Recruit updated', changes: this.changes });
    });
});

// ==========================================
// AMBASSADOR KPI SUMMARY ROUTE
// ==========================================
app.get('/api/stats', (req, res) => {
    const queries = {
        totalRecruits: 'SELECT COUNT(*) as count FROM recruits',
        chineseCount: "SELECT COUNT(*) as count FROM recruits WHERE ethnicity = 'Chinese'",
        malayCount: "SELECT COUNT(*) as count FROM recruits WHERE ethnicity = 'Malay'",
        securedBooths: "SELECT COUNT(*) as count FROM partners WHERE booth_status = 'Secured'",
        contactedPartners: "SELECT COUNT(*) as count FROM partners WHERE status != 'Not Contacted'"
    };

    db.serialize(() => {
        db.get(queries.totalRecruits, [], (err, total) => {
            db.get(queries.chineseCount, [], (err, chinese) => {
                db.get(queries.malayCount, [], (err, malay) => {
                    db.get(queries.securedBooths, [], (err, booths) => {
                        db.get(queries.contactedPartners, [], (err, contacted) => {
                            res.json({
                                totalRecruits: total ? total.count : 0,
                                chineseRecruits: chinese ? chinese.count : 0,
                                malayRecruits: malay ? malay.count : 0,
                                securedBooths: booths ? booths.count : 0,
                                contactedPartners: contacted ? contacted.count : 0
                            });
                        });
                    });
                });
            });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});