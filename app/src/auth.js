const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { createUser, getUserByEmail } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const hash = (p) => crypto.createHash('sha256').update(p).digest('hex');
const sign = (u) => jwt.sign({ sub: u.id, email: u.email }, JWT_SECRET, { expiresIn: '1h' });

function requireAuth(req, res, next) {
  const hdr = req.header('Authorization') || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
}

function routes(app) {
  app.post('/auth/register', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email_password_required' });
    if (!getUserByEmail(email)) createUser(email, hash(password));
    const u = getUserByEmail(email);
    res.status(201).json({ token: sign(u) });
  });

  app.post('/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    const u = getUserByEmail(email);
    if (!u || u.passwordHash !== hash(password)) return res.status(401).json({ error: 'bad_credentials' });
    res.json({ token: sign(u) });
  });
}

module.exports = { requireAuth, authRoutes: routes };
