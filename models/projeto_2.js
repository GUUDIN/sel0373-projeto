const mongoose = require("mongoose");

const { Schema } = mongoose;

const projeto_2Schema = new Schema({
  
  tipo: { type: String, required: true }, // ex: 'temperatura', 'umidade', etc.
  valor: { type: Number },                // agora é opcional
  latitude: { type: Number },             // opcional (para 'mapa')
  longitude: { type: Number },            // opcional (para 'mapa')
  dataRecebida: { type: Date, default: Date.now }

});

module.exports = mongoose.model("Projeto_2", projeto_2Schema);
