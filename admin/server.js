// To run this server:
// 1. Ensure you have Node.js installed on your system.
// 2. Make sure this 'server.js' file and ALL your HTML files (admin-login.html, dashboard.html, user-management.html) are in the SAME folder.
// 3. Open a terminal in that folder.
// 4. If you haven't already, run: npm install express twilio cors
// 5. Run the server using the command: node server.js

// Import required packages
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all routes so the frontend can communicate with the backend
app.use(cors());

// Serve static files (HTML, CSS, JS) from the same directory as this script.
// This is a simple and effective solution to ensure all your files are found.
app.use(express.static(__dirname));

// Mock database for admin users
const admins = [
    {
        admin_id: 'admin',
        password: 'password',
        phone_number: '+15017122661',
        otp: null,
        otp_expiry: null
    }
];

// Mock database for general users
const users = [
    { id: 1, name: 'John Doe', email: 'user@campus.edu', password: 'user123', isVerified: false },
    { id: 2, name: 'Jane Smith', email: 'jane@campus.edu', password: 'user456', isVerified: true },
];

// Mock database for mental health logs
// In a real app, this would be a database connection, but here we use an array
// that we can dynamically add to.
const mentalHealthLogs = [
    { log_id: 1, user_email: 'john.doe@campus.edu', date: '2023-10-25', mood: 'Stressed', stress_level: 8, reason: 'Final exams are approaching.', comments: 'Feeling overwhelmed.', is_anonymous: false },
    { log_id: 2, user_email: 'jane@campus.edu', date: '2023-10-24', mood: 'Sad', stress_level: 6, reason: 'Family issues.', comments: 'Feeling a bit down today.', is_anonymous: false },
    { log_id: 3, user_email: 'anonymous', date: '2023-10-23', mood: 'Anxious', stress_level: 9, reason: 'Uncertainty about the future.', comments: 'Can\'t seem to relax.', is_anonymous: true },
    { log_id: 4, user_email: 'john.doe@campus.edu', date: '2023-10-22', mood: 'Neutral', stress_level: 3, reason: 'Nothing in particular.', comments: 'Just a regular day.', is_anonymous: false },
    { log_id: 5, user_email: 'peter.jones@campus.edu', date: '2023-10-21', mood: 'Happy', stress_level: 2, reason: 'Got an A on a big project.', comments: '', is_anonymous: false },
];

// Mock Twilio credentials
const accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const authToken = 'your_auth_token';
const client = twilio(accountSid, authToken);

// Generates a random 6-digit OTP.
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Endpoint for admin login
app.post('/api/login', (req, res) => {
    const { adminId, password } = req.body;
    const admin = admins.find(a => a.admin_id === adminId && a.password === password);

    if (admin) {
        const otp = generateOtp();
        const otpExpiry = Date.now() + 5 * 60 * 1000;
        
        admin.otp = otp;
        admin.otp_expiry = otpExpiry;

        console.log(`Simulated OTP for ${admin.admin_id}: ${otp}`);
        res.status(200).json({ message: 'OTP sent successfully. Check console for simulated OTP.' });
    } else {
        res.status(401).json({ message: 'Invalid Admin ID or password.' });
    }
});

// Endpoint for OTP verification
app.post('/api/verify-otp', (req, res) => {
    const { adminId, otp } = req.body;
    const admin = admins.find(a => a.admin_id === adminId);

    if (admin && admin.otp === otp && Date.now() < admin.otp_expiry) {
        admin.otp = null;
        admin.otp_expiry = null;
        res.status(200).json({ message: 'Login successful!' });
    } else {
        res.status(401).json({ message: 'Invalid or expired OTP.' });
    }
});

// New endpoint to verify user login details
app.post('/api/verify-user', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // In a real application, you would also verify the uploaded ID card here.
        // For this demo, we'll assume it's successful.
        res.status(200).json({ message: 'User verified successfully.', user: user });
    } else {
        res.status(401).json({ message: 'Invalid email or password.' });
    }
});

// Endpoint to fetch all mental health logs
app.get('/api/logs', (req, res) => {
    res.status(200).json(mentalHealthLogs);
});

// New endpoint to add a new mental health log
app.post('/api/logs', (req, res) => {
    const newLog = req.body;
    // Simple validation
    if (!newLog.user_email || !newLog.date || !newLog.mood) {
        return res.status(400).json({ message: 'Missing required log fields.' });
    }

    // Assign a new ID and add to the mock database
    newLog.log_id = mentalHealthLogs.length + 1;
    mentalHealthLogs.push(newLog);

    res.status(201).json({ message: 'Log added successfully.', log: newLog });
});

// Route to handle the root URL and serve the correct HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
