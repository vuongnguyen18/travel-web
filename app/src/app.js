const express = require('express');
const app = express();
app.use(express.json());

// serve your existing static travel site from /public (move your current assets there)
app.use(express.static(__dirname + '/../public'));

const { authRoutes } = require('./auth');
const { apiRoutes } = require('./routes');
authRoutes(app);
apiRoutes(app);

module.exports = app;
