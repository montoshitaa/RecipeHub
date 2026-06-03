const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
  },
  descripcion: {
    type: String,
    required: true,
  },
  categoria: {
    type: String,
    required: true,
  },
  tiempoMin: {
    type: Number,
    required: true,
  },
  porciones: {
    type: Number,
    required: true,
  },
  dificultad: {
    type: String,
    required: true,
    enum: ['Fácil', 'Media', 'Difícil'],
  },
  ingredientes: [
    {
      nombre: { type: String, required: true },
      cantidad: { type: Number, required: true },
      unidad: { type: String, required: true },
    },
  ],
  pasos: {
    type: [String],
    required: true,
  },
  tags: [String],
  autorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  imagenUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

recipeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Recipe', recipeSchema);
