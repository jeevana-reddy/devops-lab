// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serves static files like register.html and styles.css

// Serve the registration page on "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// MySQL connection config — uses .env values or fallback
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'event_db',
});

db.connect(err => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL database.');
});

// API endpoint for user registration
app.post('/register', (req, res) => {
  const { name, email, phone, event } = req.body;

  if (!name || !email || !phone || !event) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const sql = 'INSERT INTO registrations (name, email, phone, event) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, phone, event], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already registered.' });
      }
      console.error('❌ DB error:', err);
      return res.status(500).json({ error: 'Database error.' });
    }
    res.json({ message: '🎉 Registration successful!' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
