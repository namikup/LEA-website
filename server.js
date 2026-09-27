const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Load environment variables from local .env file if it exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
    envLines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [k, ...v] = trimmed.split('=');
            if (k && v.length) process.env[k.trim()] = v.join('=').trim();
        }
    });
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Seed defaults
const DEFAULT_PARTNERS = [
    { name: 'JKP INASIS TNB', category: 'INASIS', stage: 'Secured Free Booth', pic: 'Exco Hubungan Luar (@jkpinasistnb)', notes: 'Granted free booth during Inasis Week foyer activities.', booth_status: 'Secured' },
    { name: 'JKP INASIS MAS', category: 'INASIS', stage: 'Negotiating Booth', pic: 'YDP / Biro Keusahawanan', notes: 'Discussing co-sharing booth at cafeteria walkway.', booth_status: 'Negotiating' },
    { name: 'JKP INASIS Tradewinds', category: 'INASIS', stage: 'Pitch Sent', pic: 'Exco Kebajikan', notes: 'Sent BM proposal on financial literacy workshop.', booth_status: 'Pending' },
    { name: 'JKP INASIS Proton', category: 'INASIS', stage: 'Not Contacted', pic: '@jkpinasisproton', notes: 'To find contact of Biro Luar.', booth_status: 'Pending' },
    { name: 'JKP INASIS Petronas', category: 'INASIS', stage: 'Not Contacted', pic: '@jkpinasispetronas', notes: 'Waiting for academic calendar confirmation.', booth_status: 'Pending' },
    { name: 'JKP INASIS Maybank', category: 'INASIS', stage: 'Pitch Sent', pic: 'YDP WhatsApp', notes: 'Follow-up set for Tuesday.', booth_status: 'Pending' },
    { name: 'JKP INASIS Sime Darby', category: 'INASIS', stage: 'Not Contacted', pic: '@jkpsimedarby', notes: 'Explore student hub lounge booth.', booth_status: 'Pending' },
    { name: 'QUEST (Quantitative Science)', category: 'Academic', stage: 'Negotiating Booth', pic: 'VP External (@quest_uum)', notes: 'Exploring collaboration for financial modeling interest.', booth_status: 'Negotiating' },
    { name: 'ECOSOC (School of Economics)', category: 'Academic', stage: 'Secured Free Booth', pic: 'Biro Akademik (@ecosocuum)', notes: 'Agreed to co-promote 23 June talk in return for supporting logo.', booth_status: 'Secured' },
    { name: 'COMSAT (Computing Society)', category: 'Academic', stage: 'Pitch Sent', pic: 'Corporate Exco (@comsat_uum)', notes: 'Proposing fintech career workshop for IT majors.', booth_status: 'Pending' },
    { name: 'MPP Representative (SEFB / COB)', category: 'Academic', stage: 'Pitch Sent', pic: 'MPP Kerusi COB', notes: 'Requesting permission to place banner in SEFB foyer.', booth_status: 'Pending' },
    { name: 'PERMADA (Kelab Mahasiswa Kedah)', category: 'State Club', stage: 'Negotiating Booth', pic: 'YDP PERMADA', notes: 'Offered RM150 token sponsorship for their community night in return for a booth.', booth_status: 'Negotiating' },
    { name: 'IKMAM (Ikatan Mahasiswa Melaka)', category: 'State Club', stage: 'Pitch Sent', pic: 'Setiausaha (@ikmam_uum)', notes: 'Pitch sent via WhatsApp.', booth_status: 'Pending' },
    { name: 'SEPERAK (Persatuan Anak Perak)', category: 'State Club', stage: 'Not Contacted', pic: '@seperak_uum', notes: 'Gather contact details from Inasis lounge.', booth_status: 'Pending' },
    { name: 'Pesta Angpau UUM (UUMPAC)', category: 'Cultural', stage: 'Negotiating Booth', pic: 'Sponsorship Exco (@uumpac)', notes: 'High density Chinese audience. Looking at sponsorship package vs free info table.', booth_status: 'Negotiating' },
    { name: 'Kelab Kebudayaan Tionghua (UUM CCC)', category: 'Cultural', stage: 'Secured Free Booth', pic: 'President CCC', notes: 'Co-hosting financial literacy teaser during gathering.', booth_status: 'Secured' }
];

const DEFAULT_LEADS = [
    { name: 'Tan Wei Hong', demo: 'Chinese', faculty: 'SEFB', inasis: 'TNB', source: 'Direct Chat', status: 'Joined LEA', contact: '+6012-7889123' },
    { name: 'Lim Mei Ling', demo: 'Chinese', faculty: 'SQS', inasis: 'MAS', source: 'QUEST Event', status: 'RSVP-ed', contact: '@meiling_lim' },
    { name: 'Aiman Farhan', demo: 'Malay', faculty: 'SEFB', inasis: 'Tradewinds', source: 'Foyer Booth', status: 'Attended', contact: '+6017-9002134' },
    { name: 'Chong Jia Jun', demo: 'Chinese', faculty: 'SOC', inasis: 'Maybank', source: 'WhatsApp Group', status: 'RSVP-ed', contact: '+6011-2349182' },
    { name: 'Nurul Izzah', demo: 'Malay', faculty: 'TISSA', inasis: 'Petronas', source: 'Friend Referral', status: 'Lead', contact: '+6019-8812901' },
    { name: 'Lucas Wong', demo: 'Chinese', faculty: 'SBM', inasis: 'Proton', source: 'Instagram DM', status: 'Joined LEA', contact: '@lucas_wong99' }
];

// Initialize SQLite Database
const db = new sqlite3.Database(path.join(__dirname, 'ambassador.db'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database (ambassador.db)');
        initDatabase();
    }
});

function initDatabase() {
    db.serialize(() => {
        // Table 1: Partners & Campus Entities
        db.run(`
            CREATE TABLE IF NOT EXISTS partners (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT,
                category TEXT,
                contact_person TEXT,
                pic TEXT,
                phone TEXT,
                contact TEXT,
                status TEXT DEFAULT 'Not Contacted',
                stage TEXT DEFAULT 'Not Contacted',
                booth_status TEXT DEFAULT 'Pending',
                notes TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration safety for partners
        db.run("ALTER TABLE partners ADD COLUMN category TEXT", () => {});
        db.run("ALTER TABLE partners ADD COLUMN stage TEXT", () => {});
        db.run("ALTER TABLE partners ADD COLUMN pic TEXT", () => {});
        db.run("ALTER TABLE partners ADD COLUMN contact TEXT", () => {});

        // Table 2: Student Recruits & Leads
        db.run(`
            CREATE TABLE IF NOT EXISTS recruits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                ethnicity TEXT,
                demo TEXT,
                faculty TEXT,
                year INTEGER DEFAULT 1,
                inasis TEXT,
                source TEXT,
                phone TEXT,
                contact TEXT,
                stage TEXT DEFAULT 'Lead',
                status TEXT DEFAULT 'Lead',
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migration safety for recruits
        db.run("ALTER TABLE recruits ADD COLUMN demo TEXT", () => {});
        db.run("ALTER TABLE recruits ADD COLUMN inasis TEXT", () => {});
        db.run("ALTER TABLE recruits ADD COLUMN source TEXT", () => {});
        db.run("ALTER TABLE recruits ADD COLUMN contact TEXT", () => {});
        db.run("ALTER TABLE recruits ADD COLUMN status TEXT", () => {});

        // Seed default partners if table is empty
        db.get('SELECT COUNT(*) as count FROM partners', (err, row) => {
            if (!err && row && row.count === 0) {
                seedPartners();
            }
        });

        // Seed default recruits if table is empty
        db.get('SELECT COUNT(*) as count FROM recruits', (err, row) => {
            if (!err && row && row.count === 0) {
                seedRecruits();
            }
        });
    });
}

function seedPartners() {
    const stmt = db.prepare(`
        INSERT INTO partners (name, category, type, stage, status, pic, contact_person, booth_status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    DEFAULT_PARTNERS.forEach(p => {
        stmt.run([p.name, p.category, p.category, p.stage, p.stage, p.pic, p.pic, p.booth_status, p.notes]);
    });
    stmt.finalize();
    console.log('Seeded default UUM partners into database');
}

function seedRecruits() {
    const stmt = db.prepare(`
        INSERT INTO recruits (name, demo, ethnicity, faculty, inasis, source, contact, phone, status, stage, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    DEFAULT_LEADS.forEach(l => {
        stmt.run([l.name, l.demo, l.demo, l.faculty, l.inasis, l.source, l.contact, l.contact, l.status, l.status, '']);
    });
    stmt.finalize();
    console.log('Seeded default UUM recruits into database');
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
const VALID_CREDENTIALS = [
    { username: process.env.ADMIN_USERNAME || 'admin', password: process.env.ADMIN_PASSWORD || 'leauum2025', role: 'Lead Ambassador' },
    { username: process.env.AMBASSADOR_USERNAME || 'ambassador', password: process.env.AMBASSADOR_PASSWORD || 'leauum2025', role: 'Campus Ambassador' }
];

// Authenticate ambassador login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body || {};
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = VALID_CREDENTIALS.find(u =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password.trim()
    );

    if (user) {
        const token = Buffer.from(`${user.username}:${Date.now()}`).toString('base64');
        return res.json({
            success: true,
            token,
            user: { username: user.username, role: user.role }
        });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
});

// ==========================================
// PARTNER / OUTREACH ROUTES
// ==========================================

// Get all partners
app.get('/api/partners', (req, res) => {
    db.all('SELECT * FROM partners ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const mapped = rows.map(r => ({
            id: r.id,
            name: r.name,
            category: r.category || r.type || 'Other',
            stage: r.stage || r.status || 'Not Contacted',
            pic: r.pic || r.contact_person || '',
            contact: r.contact || r.phone || '',
            booth_status: r.booth_status || (r.stage === 'Secured Free Booth' ? 'Secured' : 'Pending'),
            notes: r.notes || ''
        }));
        res.json(mapped);
    });
});

// Add a new partner
app.post('/api/partners', (req, res) => {
    const { name, category, type, stage, status, pic, contact_person, contact, phone, booth_status, notes } = req.body;
    const cat = category || type || 'Other';
    const stg = stage || status || 'Not Contacted';
    const contactPerson = pic || contact_person || '';
    const cont = contact || phone || '';
    const booth = booth_status || (stg === 'Secured Free Booth' ? 'Secured' : (stg === 'Negotiating Booth' ? 'Negotiating' : 'Pending'));

    const sql = `
        INSERT INTO partners (name, category, type, stage, status, pic, contact_person, contact, phone, booth_status, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [name, cat, cat, stg, stg, contactPerson, contactPerson, cont, cont, booth, notes || ''], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
            id: this.lastID,
            name,
            category: cat,
            stage: stg,
            pic: contactPerson,
            contact: cont,
            booth_status: booth,
            notes: notes || ''
        });
    });
});

// Update partner status or details
app.put('/api/partners/:id', (req, res) => {
    const { id } = req.params;
    const { name, category, type, stage, status, pic, contact_person, contact, phone, booth_status, notes } = req.body;

    const cat = category || type;
    const stg = stage || status;
    const contactPerson = pic || contact_person;
    const cont = contact || phone;
    const booth = booth_status || (stg === 'Secured Free Booth' ? 'Secured' : undefined);

    const sql = `
        UPDATE partners 
        SET name = COALESCE(?, name),
            category = COALESCE(?, category),
            type = COALESCE(?, type),
            stage = COALESCE(?, stage),
            status = COALESCE(?, status),
            pic = COALESCE(?, pic),
            contact_person = COALESCE(?, contact_person),
            contact = COALESCE(?, contact),
            phone = COALESCE(?, phone),
            booth_status = COALESCE(?, booth_status),
            notes = COALESCE(?, notes),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;
    db.run(sql, [name, cat, cat, stg, stg, contactPerson, contactPerson, cont, cont, booth, notes, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Partner updated successfully', id: Number(id), changes: this.changes });
    });
});

// Delete partner
app.delete('/api/partners/:id', (req, res) => {
    db.run('DELETE FROM partners WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Partner deleted', id: req.params.id, changes: this.changes });
    });
});

// ==========================================
// STUDENT RECRUITMENT ROUTES
// ==========================================

// Get all recruits
app.get('/api/recruits', (req, res) => {
    db.all('SELECT * FROM recruits ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const mapped = rows.map(r => ({
            id: r.id,
            name: r.name,
            demo: r.demo || r.ethnicity || 'Other',
            faculty: r.faculty || '',
            year: r.year || 1,
            inasis: r.inasis || '',
            source: r.source || '',
            contact: r.contact || r.phone || '',
            status: r.status || r.stage || 'Lead',
            notes: r.notes || ''
        }));
        res.json(mapped);
    });
});

// Add a recruit lead
app.post('/api/recruits', (req, res) => {
    const { name, demo, ethnicity, faculty, year, inasis, source, contact, phone, status, stage, notes } = req.body;
    const eth = demo || ethnicity || 'Other';
    const cont = contact || phone || '';
    const stg = status || stage || 'Lead';

    const sql = `
        INSERT INTO recruits (name, demo, ethnicity, faculty, year, inasis, source, contact, phone, status, stage, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(sql, [name, eth, eth, faculty || '', year || 1, inasis || '', source || '', cont, cont, stg, stg, notes || ''], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
            id: this.lastID,
            name,
            demo: eth,
            faculty: faculty || '',
            year: year || 1,
            inasis: inasis || '',
            source: source || '',
            contact: cont,
            status: stg,
            notes: notes || ''
        });
    });
});

// Update recruit pipeline stage or details
app.put('/api/recruits/:id', (req, res) => {
    const { id } = req.params;
    const { name, demo, ethnicity, faculty, year, inasis, source, contact, phone, status, stage, notes } = req.body;

    const eth = demo || ethnicity;
    const cont = contact || phone;
    const stg = status || stage;

    const sql = `
        UPDATE recruits 
        SET name = COALESCE(?, name),
            demo = COALESCE(?, demo),
            ethnicity = COALESCE(?, ethnicity),
            faculty = COALESCE(?, faculty),
            year = COALESCE(?, year),
            inasis = COALESCE(?, inasis),
            source = COALESCE(?, source),
            contact = COALESCE(?, contact),
            phone = COALESCE(?, phone),
            status = COALESCE(?, status),
            stage = COALESCE(?, stage),
            notes = COALESCE(?, notes)
        WHERE id = ?
    `;
    db.run(sql, [name, eth, eth, faculty, year, inasis, source, cont, cont, stg, stg, notes, id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Recruit updated', id: Number(id), changes: this.changes });
    });
});

// Delete recruit
app.delete('/api/recruits/:id', (req, res) => {
    db.run('DELETE FROM recruits WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Recruit deleted', id: req.params.id, changes: this.changes });
    });
});

// ==========================================
// AMBASSADOR KPI SUMMARY ROUTE
// ==========================================
app.get('/api/stats', (req, res) => {
    const queries = {
        totalRecruits: 'SELECT COUNT(*) as count FROM recruits',
        chineseCount: "SELECT COUNT(*) as count FROM recruits WHERE demo = 'Chinese' OR ethnicity = 'Chinese'",
        malayCount: "SELECT COUNT(*) as count FROM recruits WHERE demo = 'Malay' OR ethnicity = 'Malay'",
        securedBooths: "SELECT COUNT(*) as count FROM partners WHERE stage = 'Secured Free Booth' OR booth_status = 'Secured'",
        contactedPartners: "SELECT COUNT(*) as count FROM partners WHERE stage != 'Not Contacted' AND status != 'Not Contacted'"
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

// Reset database to default template
app.post('/api/reset', (req, res) => {
    db.serialize(() => {
        db.run('DELETE FROM partners', () => {});
        db.run('DELETE FROM recruits', () => {});
        seedPartners();
        seedRecruits();
        res.json({ message: 'Database reset to default seed data successfully' });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});