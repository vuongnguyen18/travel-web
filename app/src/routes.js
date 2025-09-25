const client = require('prom-client');
const { addTodo, listTodos, updateTodo, deleteTodo } = require('./db');
const { requireAuth } = require('./auth');

const Registry = client.Registry;
const register = new Registry();
client.collectDefaultMetrics({ register });
const httpReqs = new client.Counter({ name: 'http_requests_total', help: 'Total HTTP requests', labelNames: ['route','method','status'] });
register.registerMetric(httpReqs);

function wrapMetrics(route, handler) {
  return async (req, res, next) => {
    const end = (status) => httpReqs.inc({ route, method: req.method, status });
    try {
      await handler(req, res);
      // status set inside handler; incr in res.finish
    } catch (e) { end(500); next(e); }
    res.once('finish', () => end(res.statusCode));
  };
}

function routes(app) {
  app.get('/health', (req, res) => res.type('text').send('ok'));
  app.get('/metrics', async (_req, res) => res.type(register.contentType).send(await register.metrics()));

  app.get('/todos', requireAuth, wrapMetrics('/todos', (req, res) => {
    res.json(listTodos(req.user.sub));
  }));
  app.post('/todos', requireAuth, wrapMetrics('/todos', (req, res) => {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text_required' });
    res.status(201).json(addTodo(req.user.sub, text));
  }));
  app.put('/todos/:id', requireAuth, wrapMetrics('/todos/:id', (req, res) => {
    const t = updateTodo(req.user.sub, req.params.id, req.body || {});
    if (!t) return res.status(404).json({ error: 'not_found' });
    res.json(t);
  }));
  app.delete('/todos/:id', requireAuth, wrapMetrics('/todos/:id', (req, res) => {
    const ok = deleteTodo(req.user.sub, req.params.id);
    if (!ok) return res.status(404).json({ error: 'not_found' });
    res.status(204).send();
  }));
}
module.exports = { apiRoutes: routes };
