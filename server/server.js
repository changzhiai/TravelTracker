
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database.js');
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');

const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, '../dist')));


require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);
console.log('Google Auth initialized with Client ID:', process.env.VITE_GOOGLE_CLIENT_ID ? 'Loaded' : 'MISSING');

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

    const performRegistration = () => {
        db.createUser(username, password, email || null, (err, userId) => {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: 'User created', userId });
        });
    };

    if (email) {
        db.getUserByEmail(email, (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            if (user) {
                return res.status(409).json({ error: 'Email already in use' });
            }
            performRegistration();
        });
    } else {
        performRegistration();
    }
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

// Google Login
app.post('/api/google-login', async (req, res) => {
    const { token, isAccessToken } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    try {
        let email, name;

        if (isAccessToken) {
            console.log('Verifying Google access token...');
            try {
                // Fetch user info using the access token
                const gResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!gResponse.ok) {
                    const errorData = await gResponse.text();
                    console.error(`Google userinfo fetch failed with status ${gResponse.status}:`, errorData);

                    // Try tokeninfo as fallback if userinfo fails
                    console.log('Trying tokeninfo fallback...');
                    const tiResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
                    if (tiResponse.ok) {
                        const tiData = await tiResponse.json();
                        email = tiData.email;
                        name = ''; // tokeninfo doesn't always have name
                        console.log('Tokeninfo fallback successful for:', email);
                    } else {
                        throw new Error(`Google verification failed: Userinfo(${gResponse.status}) and Tokeninfo(${tiResponse.status})`);
                    }
                } else {
                    const gData = await gResponse.json();
                    console.log('Google userinfo response received for:', gData.email);
                    email = gData.email;
                    name = gData.name;
                }
            } catch (err) {
                console.error('Access token verification flow failed:', err);
                throw err;
            }
        } else {
            console.log('Verifying Google ID token...');
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: [process.env.VITE_GOOGLE_CLIENT_ID, process.env.VITE_IOS_GOOGLE_CLIENT_ID].filter(Boolean)
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
            console.log('Google ID token verified for:', email);
        }

        // Use email as a way to find/create user
        // If user exists by email, log them in.
        // If not, create a new user.
        db.getUserByEmail(email, (err, user) => {
            if (err) return res.status(500).json({ error: err.message });

            if (user) {
                // User exists, return user info
                return res.json({
                    message: 'Login successful',
                    user: { id: user.id, username: user.username, email: user.email, hasPassword: false }
                });
            } else {
                // Use the name from Google as username (might need to handle duplicates)
                // For simplicity, we'll try to use the name, and fallback to email prefix if it exists
                let baseUsername = name || email.split('@')[0];
                db.createUser(baseUsername, null, email, (err, userId) => {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed')) {
                            baseUsername = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
                            db.createUser(baseUsername, null, email, (err, userId) => {
                                if (err) return res.status(500).json({ error: err.message });
                                return res.json({
                                    message: 'Login successful',
                                    user: { id: userId, username: baseUsername, email: email, hasPassword: false }
                                });
                            });
                        } else {
                            return res.status(500).json({ error: err.message });
                        }
                    } else {
                        res.json({
                            message: 'Login successful',
                            user: { id: userId, username: baseUsername, email: email, hasPassword: false }
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.error('Google verification error:', error);
        res.status(401).json({ error: 'Invalid Google token' });
    }
});

// Apple Login
app.post('/api/apple-login', async (req, res) => {
    const { token, user: appleUser } = req.body;
    if (!token) return res.status(400).json({ error: 'Token is required' });

    try {
        const { sub: appleId, email } = await appleSignin.verifyIdToken(token, {
            // Verify the audience (Service ID or Bundle ID)
            audience: [process.env.VITE_APPLE_CLIENT_ID, process.env.VITE_IOS_APPLE_CLIENT_ID].filter(Boolean),
            ignoreExpiration: false,
        });

        // Use email to find/create user
        // If email is not in token (can happen if user hides it, but 'sub' is always there), 
        // we might need to rely on 'sub'. But for now we'll use email as primary.
        db.getUserByEmail(email, (err, user) => {
            if (err) return res.status(500).json({ error: err.message });

            if (user) {
                // User exists, return user info
                return res.json({
                    message: 'Login successful',
                    user: { id: user.id, username: user.username, email: user.email, hasPassword: false }
                });
            } else {
                // User doesn't exist, create a new one
                // Use the name from appleUser if provided (first login), otherwise use email prefix
                let firstName = appleUser?.name?.firstName || '';
                let lastName = appleUser?.name?.lastName || '';
                let fullName = [firstName, lastName].filter(Boolean).join(' ');
                let baseUsername = fullName || email.split('@')[0];

                db.createUser(baseUsername, null, email, (err, userId) => {
                    if (err) {
                        if (err.message.includes('UNIQUE constraint failed')) {
                            baseUsername = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
                            db.createUser(baseUsername, null, email, (err, userId) => {
                                if (err) return res.status(500).json({ error: err.message });
                                return res.json({
                                    message: 'Login successful',
                                    user: { id: userId, username: baseUsername, email: email, hasPassword: false }
                                });
                            });
                        } else {
                            return res.status(500).json({ error: err.message });
                        }
                    } else {
                        res.json({
                            message: 'Login successful',
                            user: { id: userId, username: baseUsername, email: email, hasPassword: false }
                        });
                    }
                });
            }
        });
    } catch (error) {
        console.error('Apple verification error:', error);
        res.status(401).json({ error: 'Invalid Apple token' });
    }
});

// Apple Callback (Redirect URI) - Matches MapParser strategy
app.post(['/api/apple-callback', '/api-callback', '/api/api-callback'], (req, res) => {
    console.log(`[Apple Callback] Received request at ${req.url} with method ${req.method}`);
    console.log(`[Apple Callback] Body received: ${JSON.stringify(req.body)}`);
    const { id_token, code, user, state } = req.body;
    
    // Detect if we should redirect back to the app (mobile)
    // We check both the 'state' parameter and the User-Agent as a backup
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    const isMobileUA = userAgent.includes('android') || userAgent.includes('iphone') || userAgent.includes('ipad');
    const isMobileState = state && (state.startsWith('platform:mobile') || state.includes('platform:mobile'));
    
    const isMobile = isMobileState || isMobileUA;
    console.log(`[Apple Callback] Detection - isMobileState: ${isMobileState}, isMobileUA: ${isMobileUA}, State: ${state}`);
    
    if (isMobile) {
        // Construct the custom app URL. Android uses 'com.traveltracker.app' as the scheme.
        let queryParams = `?apple_id_token=${encodeURIComponent(id_token || '')}`;
        if (user) queryParams += `&apple_user=${encodeURIComponent(user)}`;
        if (state) queryParams += `&state=${encodeURIComponent(state)}`;
        
        const appUrl = `com.traveltracker.app://apple-callback${queryParams}`;
        console.log(`Mobile detected. Redirecting to app: ${appUrl}`);

        // Bridge Page to ensure Android Chrome handles the redirect reliably
        return res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Redirecting to Travel Tracker...</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: -apple-system, system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafafa; color: #333; text-align: center; padding: 20px; }
                    .loader { border: 3px solid #f3f3f3; border-top: 3px solid #4f46e5; border-radius: 50%; width: 44px; height: 44px; animation: spin 1s linear infinite; margin-bottom: 24px; }
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    .btn { color: white; background: #6366f1; text-decoration: none; margin-top: 30px; padding: 14px 28px; border-radius: 12px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                    p { color: #666; margin-bottom: 0; }
                </style>
            </head>
            <body>
                <div class="loader"></div>
                <h2>Almost there!</h2>
                <p>Returning you to the Travel Tracker app...</p>
                <a href="${appUrl}" class="btn">Open App</a>
                <script>
                    window.location.href = "${appUrl}";
                    setTimeout(() => { window.location.href = "${appUrl}"; }, 1000);
                </script>
            </body>
            </html>
        `);
    }

    // Default web fallback (if not mobile)
    res.send('Success! You can close this window.');
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`);

    db.verifyUser(username, password, (err, isValid, user) => {
        if (err) {
            console.error(`Login error for ${username}:`, err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!isValid) {
            console.warn(`Invalid login attempt for: ${username}`);
            if (user && user.isOAuthOnly) {
                return res.status(401).json({ error: 'This account is linked to Google or Apple. Please use the social login buttons below.' });
            }
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`Login successful for: ${user.username}`);
        res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email, hasPassword: true } });
    });
});

// Get User Profile
app.get('/api/user/:username', (req, res) => {
    const { username } = req.params;
    db.getUserByUsername(username, (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });
        // Don't return password hash
        res.json({ id: user.id, username: user.username, email: user.email, hasPassword: !!user.password });
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

// Update User Password
app.put('/api/user/:id/password', (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
    }

    db.getUserById(id, (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // If user already has a password, they MUST provide the correct current password
        if (user.password) {
            const bcrypt = require('bcryptjs');
            if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password)) {
                return res.status(401).json({ error: 'Incorrect current password' });
            }
        }

        // Update the password
        db.updateUserPassword(id, newPassword, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Password updated successfully' });
        });
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

// Delete Account
app.delete('/api/user/:id', (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    db.getUserById(id, (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // If user has a password in DB, we must verify it
        if (user.password) {
            const bcrypt = require('bcryptjs');
            if (!password) {
                return res.status(400).json({ error: 'Password is required to delete account' });
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return res.status(401).json({ error: 'Incorrect password' });
            }
        }

        // If no password in DB (Google user) or password verified successfully
        db.deleteUser(id, (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Account deleted successfully' });
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
