const mongoose = require("mongoose")

async function main(){

    try {

        await mongoose.connect("mongodb://localhost:27017/IoT_DB");
        console.log("Conectado ao Banco de Dados!");

    } catch(error){
        console.log(`Erro: ${error}`);
    }
}

module.exports = main;