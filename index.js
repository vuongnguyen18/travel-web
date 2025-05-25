const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const winston = require('winston');
const nodemailer = require('nodemailer'); // Make sure this is added at the top


const app = express();
const port = 3000;

// Logging setup with winston
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/errors.log' })
  ]
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public_html'));
app.use(express.static('views'));
app.use(morgan('dev')); // logs requests to console
app.use(express.json());


// Set view engine for rendering EJS
app.set('view engine', 'ejs');

// Connect to SQLite DB
const db = new sqlite3.Database('./contact_data.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to the database.');
});

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// POST form submission
app.post('/submit-form', (req, res) => {
 console.log("🟢 POST /submit-form route hit");

  const { firstName, lastName, email, phone, message } = req.body;
  console.log("Form data received:", req.body);

  db.run(
    `INSERT INTO contacts (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)`,
    [firstName, lastName, email, phone],
    function (err) {
      if (err) {
        console.error("Contact insert error:", err);
        return res.status(500).send("Database error (contact)");
      }

      const contactId = this.lastID;

      db.run(
        `INSERT INTO messages (contactId, message) VALUES (?, ?)`,
        [contactId, message],
        async (err2) => {
          if (err2) {
            console.error("Message insert error:", err2);
            return res.status(500).send("Database error (message)");
          }

          // Send email using Nodemailer
          try {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'nguyentienvuong2t@gmail.com',
                pass: 'fkylftaksjhxylkv'
              }
            });

            const mailOptions = {
              from: email,
              to: 'nguyentienvuong2t@gmail.com', // Your admin email
              subject: 'New Contact Form Submission',
              text: `Name: ${firstName} ${lastName}
              Email: ${email}
              Phone: ${phone}
              Message: ${message}`
            };

            await transporter.sendMail(mailOptions);
            console.log('Email sent successfully');
          } catch (emailError) {
            console.error('Failed to send email:', emailError);
            logger.error(emailError);
          }

          // ✅ Render confirmation page
          res.render('result', {
            firstName,
            lastName,
            email,
            phone,
            message
          });
        }
      );
    }
  );
});

// Error handling
// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public_html', '404.html'));
});

// 500 handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).sendFile(path.join(__dirname, 'public_html', '500.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
