const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const recetasRoutes = require('./routes/recetas.routes');
const comentariosRoutes = require('./routes/comentarios.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/recetas', recetasRoutes);
app.use('/api/recetas', comentariosRoutes);

module.exports = app;
