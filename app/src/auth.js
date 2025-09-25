import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'dev-secret';

const users = new Map(); // { email -> { email, pass } }

router.post('/register', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
  users.set(email, { email, pass: password });
  const token = jwt.sign({ sub: email, email }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const u = users.get(email);
  if (!u || u.pass !== password) return res.status(401).json({ error: 'invalid_credentials' });
  const token = jwt.sign({ sub: email, email }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

export function authRequired(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'unauthorized' });
  }
}

export default router;
