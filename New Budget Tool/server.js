/*const http = require('http');
const fs = require('fs');
const path = require('path');

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  // Serve files from the public directory
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'login-page.html' : req.url);
  const extname = path.extname(filePath);
  let contentType = 'text/html';

  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.html':
      contentType = 'text/html';
      break;
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.gif':
      contentType = 'image/png';
      break;
    // Add more cases if needed
    default:
      contentType = 'application/octet-stream';
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code == 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Sorry, there was an error: ' + err.code + ' ..\n');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});*/

const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3001;

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set up the SQLite database
const db = new sqlite3.Database('./financeApp.db', (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create the tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      amount REAL,
      description TEXT,
      date TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      amount REAL,
      description TEXT,
      date TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      amount REAL,
      name TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      name TEXT,
      FOREIGN KEY(userId) REFERENCES users(id)
    );
  `);

});

// Middleware to set a default userId for testing
app.use((req, res, next) => {
    if (!req.session.userId) {
        req.session.userId = 1; // Set a default userId
    }
    next();
});

// Login endpoint
app.post('/login', (req, res) => {
  const { identifier, password } = req.body;

  const sql = `SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ?`;
  db.get(sql, [identifier, identifier, password], (err, row) => {
    if(err) {
      console.error("Login Error:", err.message);
      res.status(500).json({ error: "Internal Server Error" });
    } else if(row) {
        req.session.userId = row.id; // Set the userId in session
        res.json({ success: true, message: "Login Successful "});
    } else {
      res.status(401).json({ success: false, message: "Invalid username or Password" });
    }
  });
});

// Logout endpoint
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if(err) {
      return res.status(500).send("Error logging out.");
    }
    res.clearCookie('connect.sid');
    res.send("Logged out successfully.");
  });
});

// Handle form submission to create a user
app.post('/submit-user', (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;
    const sql = `INSERT INTO users (firstName, lastName, username, email, password)
                 VALUES (?, ?, ?, ?, ?)`;

    db.run(sql, [firstName, lastName, username, email, password], (err) => {
        if (err) {
            console.error("Error inserting user:", err.message);
            res.status(500).send("User creation failed.");
        } else {
            res.send("User created successfully!");
        }
    });
});

// Endpoint to save income
app.post('/save-income', (req, res) => {
  const { amount, description, date } = req.body;
  const userId = req.session.userId;

  if(!userId) return res.status(401).send("Not logged in");

  const sql = `INSERT INTO income (userId, amount, description, date)
               VALUES (?, ?, ?, ?)`;
  db.run(sql, [userId, amount, description, date], (err) => {
    if(err) {
      console.error("Error saving income:", err.message);
      res.status(500).send("Error saving income");
    } else {
      res.send("Income saved successfully!");
    }
  });
});

// Endpoint to save expense
app.post('/save-expense', (req, res) => {
  const { amount, description, date } = req.body;
  const userId = req.session.userId;

  if(!userId) return res.status(401).send("Not logged in");

  const sql = `INSERT INTO expenses (userId, amount, description, date)
               VALUES (?, ?, ?, ?)`;
  db.run(sql, [userId, amount, description, date], (err) => {
    if(err) {
      console.error("Error saving expense:", err.message);
      res.status(500).send("Error saving expense");
    } else {
      res.send("Expense saved successfully!");
    }
  });
});

// I UPDATED THIS ONE 
app.post('/add-category', (req, res) => {
  const userId = req.session.userId;
  const { name, budget } = req.body;

  if (!userId) return res.status(401).send("Not logged in");

  // Check if the category already exists
  const selectSql = "SELECT * FROM categories WHERE userId = ? AND name = ?";
  db.get(selectSql, [userId, name], (err, row) => {
    if (err) {
      console.error("Error checking category:", err.message);
      return res.status(500).send("Error checking category.");
    }

    if (row) {
      // If category exists, update the budget
      const updateSql = "UPDATE categories SET budget = ? WHERE userId = ? AND name = ?";
      db.run(updateSql, [budget, userId, name], (err) => {
        if (err) {
          console.error("Error updating category:", err.message);
          return res.status(500).send("Error updating category.");
        }
        res.send("Category updated successfully.");
      });
    } else {
      // THIS ONE IS NEW I ADDED BUDGET
      const insertSql = "INSERT INTO categories (userId, name, budget) VALUES (?, ?, ?)";
      db.run(insertSql, [userId, name, budget], (err) => {
        if (err) {
          console.error("Error adding category:", err.message);
          return res.status(500).send("Error adding category.");
        }
        res.send("Category added successfully.");
      });
    }
  });
});


app.get('/get-categories', (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).send("Not logged in");
  }

  const sql = "SELECT name FROM categories WHERE userId = ?";
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Error fetching categories:", err.message);
      return res.status(500).send("Error fetching categories.");
    }

    const categoryNames = rows.map(row => row.name);
    res.json(categoryNames);
  });
});

//THIS IS NEW
app.get('/get-categories-with-budgets', (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).send("Not logged in");
  }

  const sql = "SELECT name, budget FROM categories WHERE userId = ?";
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Error fetching categories with budgets:", err.message);
      return res.status(500).send("Error fetching categories with budgets.");
    }

    res.json(rows);
  });
});

// Endpoint to get data (income, expenses, budgets)
app.get('/get-data', (req, res) => {
  if(!req.session.userId) return res.status(401).send("Not logged in");

  const userId = req.session.userId;
  const expensesSql = `SELECT amount, description, date FROM expenses WHERE userId = ?`;
  const incomeSql = `SELECT amount, description, date FROM income WHERE userId = ?`;
  const budgetSql = `SELECT amount, name FROM budgets WHERE userId = ?`;
  const categoriesSql = `SELECT name FROM categories WHERE userId = ?`;

  db.all(expensesSql, [userId], (err, expenses) => {
    if(err) {
      console.error("Error retrieving expenses:", err.message);
      return res.status(500).send("Error retrieving expenses.");
    }

    db.all(incomeSql, [userId], (err, income) => {
      if(err) {
        console.error("Error retrieving income:", err.message);
        return res.status(500).send("Error retrieving income.");
      }

      db.all(budgetSql, [userId], (err, budgets) => {
        if(err) {
          console.error("Error retrieving budgets:", err.message);
          return res.status(500).send("Error retrieving budgets.");
        }

          db.all(categoriesSql, [userId], (err, categories) => {
            if (err) {
              console.error("Error retrieving categories:", err.message);
              return res.status(500).send("Error retrieving categories.");
            }

        res.json({ expenses, income, budgets, categories });
      });
    });
  });
});
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});



app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'nbt.html'));
});

//I UPDATED THIS ONE
app.get("/get-expense-data", (req, res) => {
  const userId = req.session.userId;

  if (!userId) return res.status(401).send("Not logged in");

  const sqlExpenses = `
    SELECT description AS category, SUM(amount) AS totalSpent
    FROM expenses
    WHERE userId = ?
    GROUP BY description
  `;
  const sqlCategories = `
    SELECT name, budget
    FROM categories
    WHERE userId = ?
  `;

  db.all(sqlExpenses, [userId], (err, expenses) => {
    if (err) {
      console.error("Error fetching expenses:", err.message);
      return res.status(500).send("Error fetching expenses.");
    }

    db.all(sqlCategories, [userId], (err, categories) => {
      if (err) {
        console.error("Error fetching categories:", err.message);
        return res.status(500).send("Error fetching categories.");
      }

      res.json({ expenses, categories });
    });
  });
});



app.get('/get-income', (req, res) => {
  const userId = req.session.userId;

  if (!userId) return res.status(401).send("Not logged in");

  const sql = `SELECT SUM(amount) AS totalIncome FROM income WHERE userId = ?`;
  db.get(sql, [userId], (err, row) => {
    if (err) {
      console.error("Error checking income:", err.message);
      return res.status(500).send("Error checking income.");
    }

    const incomeSet = row.totalIncome > 0;
    res.json({ incomeSet });
  });
});

app.post('/save-income', (req, res) => {
  const userId = req.session.userId;
  const { amount } = req.body;

  if (!userId) return res.status(401).send("Not logged in");
  if (!amount || amount <= 0) return res.status(400).send("Invalid income amount");

  const sql = `INSERT INTO income (userId, amount, description, date)
               VALUES (?, ?, 'Initial Income', DATE('now'))`;

  db.run(sql, [userId, amount], (err) => {
    if (err) {
      console.error("Error saving income:", err.message);
      res.status(500).send("Error saving income.");
    } else {
      res.send("Income saved successfully.");
    }
  });
});

db.serialize(() => {
  db.run(`ALTER TABLE categories ADD COLUMN budget REAL DEFAULT 0`, (err) => {
      if (err && err.message.includes("duplicate column name")) {
          console.log("Budget column already exists in categories table.");
      } else if (err) {
          console.error("Error adding budget column:", err.message);
      } else {
          console.log("Budget column added successfully.");
      }
  });
});