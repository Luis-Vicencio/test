const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// Database Configuration
const db = mysql.createConnection({
  host: '34.56.36.189',
  user: 'root',
  password: '1234qwer',
  database: 'UsersInformation'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database!');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/api/create-user', (req, res) => {
  const { firstName, lastName, username, email, password } = req.body;

  const query = `INSERT INTO userinfo (first_name, last_name, username, email, password) VALUES (?, ?, ?, ?, ?)`;

  db.query(query, [firstName, lastName, username, email, password], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      res.status(500).send('Database error.');
      return;
    }
    console.log('User created successfully:', result);
    res.redirect('/login-page.html');
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const query = `SELECT * FROM userinfo WHERE username = ? AND password = ?`;

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).send('Database error.');
      return;
    }

    if (results.length > 0) {
      console.log('User logged in successfully:', results[0]);
      res.redirect('/index.html');
    } else {
      res.status(401).send('Invalid username or password.');
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
