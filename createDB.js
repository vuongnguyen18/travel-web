const sqlite3 = require('sqlite3').verbose();

// Connect to the database (or create it if it doesn't exist)
const db = new sqlite3.Database('contact_data.db', (err) => {
  if (err) return console.error('Error opening database:', err.message);
  console.log('Connected to contact_data.db');
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    email TEXT,
    phone TEXT
  )`, (err) => {
    if (err) console.error('Error creating contacts table:', err.message);
    else console.log('✅ contacts table ready');
  });

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contactId INTEGER,
    message TEXT,
    FOREIGN KEY(contactId) REFERENCES contacts(id)
  )`, (err) => {
    if (err) console.error('Error creating messages table:', err.message);
    else console.log('✅ messages table ready');
  });
});

// Close connection
db.close((err) => {
  if (err) return console.error('Error closing database:', err.message);
  console.log('Database closed.');
});
