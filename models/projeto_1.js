const mongoose = require("mongoose");

const { Schema } = mongoose;

const projeto_1Schema = new mongoose.Schema({

   identifier: { type: String, required: true, unique: true },

   allowed: { type: String, required: true }, 

   peso: { type: String },

   registradoPor: { type: String, required: true },

   dataPesoAtualizado: { type: String },
   
}, { timestamps: true });

module.exports = mongoose.model("Projeto_1", projeto_1Schema);

