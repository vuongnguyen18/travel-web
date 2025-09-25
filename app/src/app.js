import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter, { authRequired } from './auth.js';
import todosRouter from './routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// health
app.get('/health', (_req, res) => res.json({ ok: true }));

// auth + protected todos
app.use('/auth', authRouter);
app.use('/todos', authRequired, todosRouter);

// serve static site from /web
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/', express.static(path.join(__dirname, '../../web')));

export default app;
