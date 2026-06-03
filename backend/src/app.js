const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const recipeRoutes = require('./routes/recipe.routes');
const commentRoutes = require('./routes/comment.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/recipes', commentRoutes);

module.exports = app;
