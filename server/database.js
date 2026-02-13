
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'travel_tracker.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

const SCOPE_TABLES = {
    'world': 'visits_world',
    'usa': 'visits_usa',
    'usaParks': 'visits_usa_parks',
    'europe': 'visits_europe',
    'china': 'visits_china',
    'india': 'visits_india'
};

db.serialize(() => {
    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT
  )`, (err) => {
        if (!err) {
            // Check if email column exists (migration for existing db)
            db.all("PRAGMA table_info(users)", (err, rows) => {
                if (!err && rows) {
                    const hasEmail = rows.some(r => r.name === 'email');
                    if (!hasEmail) {
                        console.log("Migrating: Adding email column to users table...");
                        db.run("ALTER TABLE users ADD COLUMN email TEXT", (err) => {
                            if (err) console.error("Migration failed:", err.message);
                            else console.log("Migration successful: email column added.");
                        });
                    }
                }
            });
        }
    });

    // Create Visits tables for each scope
    Object.values(SCOPE_TABLES).forEach(tableName => {
        db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        location TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        UNIQUE(user_id, location)
      )`);
    });

    // Create Verification Codes table
    db.run(`CREATE TABLE IF NOT EXISTS verification_codes (
        email TEXT PRIMARY KEY,
        code TEXT,
        expires_at INTEGER
    )`);
});

const createVerificationCode = (email, code, callback) => {
    // Expires in 15 minutes (Unix timestamp in ms)
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const stmt = db.prepare("INSERT OR REPLACE INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)");
    stmt.run(email, code, expiresAt, function (err) {
        callback(err);
    });
    stmt.finalize();
};

const getVerificationCode = (email, callback) => {
    db.get("SELECT * FROM verification_codes WHERE email = ?", [email], (err, row) => {
        callback(err, row);
    });
};

const deleteVerificationCode = (email, callback) => {
    db.run("DELETE FROM verification_codes WHERE email = ?", [email], (err) => {
        // execute callback if provided
        if (callback) callback(err);
    });
};

const createUser = (username, password, email, callback) => {
    const hash = password ? bcrypt.hashSync(password, 10) : null;
    const stmt = db.prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)");
    stmt.run(username, hash, email, function (err) {
        callback(err, this ? this.lastID : null);
    });
    stmt.finalize();
};

const getUserByUsername = (username, callback) => {
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        callback(err, row);
    });
};

const getUserByEmail = (email, callback) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        callback(err, row);
    });
};

const getUserById = (id, callback) => {
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
        callback(err, row);
    });
};

const verifyUser = (identifier, password, callback) => {
    db.get("SELECT * FROM users WHERE username = ? OR email = ?", [identifier, identifier], (err, user) => {
        if (err || !user) {
            return callback(err, false, null);
        }
        const isValid = bcrypt.compareSync(password, user.password);
        callback(null, isValid, user);
    });
};

const updateUserPassword = (userId, newPassword, callback) => {
    const hash = bcrypt.hashSync(newPassword, 10);
    const stmt = db.prepare("UPDATE users SET password = ? WHERE id = ?");
    stmt.run(hash, userId, function (err) {
        callback(err);
    });
    stmt.finalize();
};

const updateUserProfile = (userId, newUsername, newEmail, callback) => {
    // Only update fields that are provided
    const stmt = db.prepare("UPDATE users SET username = ?, email = ? WHERE id = ?");
    stmt.run(newUsername, newEmail, userId, function (err) {
        callback(err);
    });
    stmt.finalize();
};

const getUserVisits = (userId, scope, callback) => {
    const tableName = SCOPE_TABLES[scope];
    if (!tableName) {
        return callback(new Error('Invalid scope'), null);
    }

    // Validate scope is a key in SCOPE_TABLES to prevent injection (already done via lookup, but good practice)
    db.all(`SELECT location FROM ${tableName} WHERE user_id = ?`, [userId], (err, rows) => {
        if (err) {
            callback(err, null);
            return;
        }
        const locations = rows.map(r => r.location);
        callback(null, locations);
    });
};

const saveUserVisits = (userId, scope, locations, callback) => {
    const tableName = SCOPE_TABLES[scope];
    if (!tableName) {
        return callback(new Error('Invalid scope'));
    }

    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // Delete existing visits for this user in this scope's table
        db.run(`DELETE FROM ${tableName} WHERE user_id = ?`, [userId]);

        const stmt = db.prepare(`INSERT INTO ${tableName} (user_id, location) VALUES (?, ?)`);

        locations.forEach(loc => {
            stmt.run(userId, loc);
        });

        stmt.finalize();

        db.run("COMMIT", callback);
    });
};

const migrateData = () => {
    // Optional: Migrate old data if needed. For now we assume fresh start or user re-saves.
    // If we wanted to migrate, we'd read from 'visits' and insert into new tables.
    // db.all("SELECT * FROM visits", [], (err, rows) => { ... });
};

const deleteUser = (userId, callback) => {
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        // Delete visits from all scope tables
        Object.values(SCOPE_TABLES).forEach(tableName => {
            db.run(`DELETE FROM ${tableName} WHERE user_id = ?`, [userId]);
        });

        // Delete user
        db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
            if (err) {
                db.run("ROLLBACK");
                callback(err);
                return;
            }
            db.run("COMMIT", (commitErr) => {
                callback(commitErr);
            });
        });
    });
};

module.exports = {
    db,
    createUser,
    getUserByUsername,
    getUserByEmail,
    getUserById,
    verifyUser,
    getUserVisits,
    saveUserVisits,
    updateUserPassword,
    updateUserProfile,
    createVerificationCode,
    getVerificationCode,
    deleteVerificationCode,
    deleteUser
};
