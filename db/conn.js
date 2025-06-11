const mongoose = require("mongoose")

async function main(){

    try {

        await mongoose.connect("mongodb://localhost:27017/IoT_DB");
        console.log("Conectado ao Banco de Dados!");
//mongodb://127.0.0.1:27017
//mongodb://localhost:27017/
    } catch(error){
        console.log(`Erro: ${error}`);
    }
}
main();
module.exports = main;