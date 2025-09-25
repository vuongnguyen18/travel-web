import express from 'express';
const router = express.Router();

// in-memory todos per user
const store = new Map(); // sub -> [{_id,text,done}]

router.get('/', (req, res) => {
  const list = store.get(req.user.sub) || [];
  res.json(list);
});

router.post('/', (req, res) => {
  const { text } = req.body || {};
  const t = { _id: String(Date.now()), text: text || '', done: false };
  const list = store.get(req.user.sub) || [];
  list.push(t);
  store.set(req.user.sub, list);
  res.status(201).json(t);
});

router.put('/:id', (req, res) => {
  const list = store.get(req.user.sub) || [];
  const item = list.find(x => x._id === req.params.id);
  if (!item) return res.status(404).json({ error: 'not_found' });
  Object.assign(item, req.body || {});
  res.json(item);
});

router.delete('/:id', (req, res) => {
  const list = store.get(req.user.sub) || [];
  const idx = list.findIndex(x => x._id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not_found' });
  list.splice(idx, 1);
  store.set(req.user.sub, list);
  res.status(204).end();
});

export default router;
