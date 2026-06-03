const mongoose = require('mongoose');

const recetaSchema = new mongoose.Schema({
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
      nombre: String,
      cantidad: String,
      unidad: String,
    },
  ],
  pasos: [
    {
      type: String,
    },
  ],
  tags: [
    {
      type: String,
    },
  ],
  autorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  imagenUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model('Receta', recetaSchema);
