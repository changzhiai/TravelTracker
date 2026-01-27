
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database.js');

const nodemailer = require('nodemailer');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());


// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, '../dist')));


require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Email Transporter
// Supports Gmail, Outlook (Hotmail), etc. via standard services or SMTP
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'hotmail', // Default to hotmail/outlook if not specified
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, code) => {
    // If credentials are provided, send real email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log(`Attempting to send email to ${to}...`);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Travel Tracker - Password Reset Code',
            text: `Your verification code is: ${code}\n\nThis code will expire in 15 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4F46E5;">Password Reset</h2>
                    <p>You requested a password reset for your Travel Tracker account.</p>
                    <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111;">${code}</span>
                    </div>
                    <p style="color: #666; font-size: 14px;">This code will expire in 15 minutes.</p>
                    <p style="color: #888; font-size: 12px; margin-top: 30px;">If you didn't request this code, you can safely ignore this email.</p>
                </div>
            `
        };
        return transporter.sendMail(mailOptions);
    } else {
        // Fallback to simulation if no credentials
        console.log(`\n=== EMAIL SIMULATION (Configure .env to send real emails) ===\nTo: ${to}\nSubject: Password Reset Code\nCode: ${code}\n============================================================\n`);
        return Promise.resolve();
    }
};

// Routes

// Send Verification Code
app.post('/api/send-code', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    db.getUserByEmail(email, (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        db.createVerificationCode(email, code, async (err) => {
            if (err) return res.status(500).json({ error: err.message });

            try {
                await sendEmail(email, code);
                res.json({ message: 'Verification code sent' });
            } catch (emailErr) {
                console.error("Email send error:", emailErr);
                res.status(500).json({ error: 'Failed to send email' });
            }
        });
    });
});

// Register
app.post('/api/register', (req, res) => {
    const { username, password, email } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    db.createUser(username, password, email || null, (err, userId) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'User created', userId });
    });
});

// Reset Password
app.post('/api/reset-password', (req, res) => {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
        return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    db.getVerificationCode(email, (err, record) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!record) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        if (record.code !== code) {
            return res.status(400).json({ error: 'Incorrect verification code' });
        }

        if (record.expires_at < Date.now()) {
            return res.status(400).json({ error: 'Verification code expired' });
        }

        // Code is valid, proceed to reset password
        db.getUserByEmail(email, (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!user) return res.status(404).json({ error: 'User not found' });

            db.updateUserPassword(user.id, newPassword, (err) => {
                if (err) return res.status(500).json({ error: err.message });

                // Clean up used code
                db.deleteVerificationCode(email);

                res.json({ message: 'Password updated successfully' });
            });
        });
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body; // Frontend still sends 'username' field

    db.verifyUser(username, password, (err, isValid, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

        // Return user info (could return a token here in a real app)
        res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
    });
});

// Get User Profile
app.get('/api/user/:username', (req, res) => {
    const { username } = req.params;
    db.getUserByUsername(username, (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        // Don't return password hash
        res.json({ id: user.id, username: user.username, email: user.email });
    });
});

// Update User Profile
app.put('/api/user/:id', (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    db.updateUserProfile(id, username, email || null, (err) => {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ error: 'Username already exists' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Profile updated successfully' });
    });
});

// Get Visits
app.get('/api/visits/:username/:scope', (req, res) => {
    const { username, scope } = req.params;

    db.getUserByUsername(username, (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        db.getUserVisits(user.id, scope, (err, locations) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ locations });
        });
    });
});

// Save Visits
app.post('/api/visits', (req, res) => {
    const { username, scope, locations } = req.body;

    db.getUserByUsername(username, (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        db.saveUserVisits(user.id, scope, locations, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Visits saved' });
        });
    });
});

// Handle React routing, return all requests to React app
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
