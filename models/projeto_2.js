const mongoose = require("mongoose");
const { float } = require("webidl-conversions");

const { Schema } = mongoose;

const projeto_2Schema = new Schema({
  
  tipo: {
  type: String,
  required: true,
  enum: ['mapa', 'temperatura', 'umidade', 'vento'],
  lowercase: true,
  trim: true
},

  valor: { type: String },                // agora é opcional
  latitude: { type: String },             // opcional (para 'mapa')
  longitude: { type: String },
  usuario: { type: String, required: true },            // opcional (para 'mapa')
  dataRecebida: { type: Date, default: Date.now }

});

module.exports = mongoose.model("Projeto_2", projeto_2Schema);
