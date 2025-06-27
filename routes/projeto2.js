<<<<<<< Updated upstream
const axios = require("axios");
const mqtt = require('mqtt');
const path = require("path");
const express = require("express");
const projeto_2 = require("../models/projeto_2"); // ALTERAÇÃO


module.exports = function(io) {
<<<<<<< Updated upstream
// Importações
=======

  const limite = 10;

  const router = express.Router();
>>>>>>> Stashed changes

const router = express.Router();

=======
// Importações
const express = require("express");
const router = express.Router();
const mqtt = require('mqtt');
const path = require("path");
>>>>>>> Stashed changes


const registrosmapa = [];
const registrostemp = [];
const registrosvento = [];
const registrosumidade = [];
 
// Conexão MQTT
const client = mqtt.connect('mqtt://igbt.eesc.usp.br', {
  username: 'mqtt',
  password: 'mqtt_123_abc'
});

const mqtt_topics = [
    'mapa',
    'temperatura',
    'umidade',
    'sensor-de-vento'
  ];
  
  // Quando conectar ao broker MQTT
client.on('connect', () => {
    client.subscribe(mqtt_topics, (err) => {
        if (err) {
            console.error(`Erro ao se inscrever nos tópicos: ${mqtt_topics.join(', ')}`, err);
            client.publish('logs/proj2',`Erro ao se inscrever nos tópicos`);
        } else {
            console.log(`Inscrito com sucesso nos tópicos: ${mqtt_topics.join(', ')}`);
            client.publish('logs/proj2', `Inscrito com sucesso nos tópicos: ${mqtt_topics.join(', ')}`);
        }
        });
});


//Recebimento dos dados via mqtt 
<<<<<<< Updated upstream
client.on('message', async (topic, payload) => {
  if (topic === 'mapa') {
    try {
      const mensagem = JSON.parse(payload.toString());
      const { lat, long } = mensagem;

      registrosmapa.push(mensagem);
      console.log(`MQTT: Mapa atualizado - ${lat}: ${long}`);

      // Emite coordenadas para o frontend
      io.emit('nova-coordenada', { lat, lon: long });

      // Faz requisição à API de clima
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true`;
      const { data } = await axios.get(url);

      const clima = {
        temperatura: data.current_weather.temperature,
        vento: data.current_weather.windspeed,
        codigoTempo: data.current_weather.weathercode,
        horario: data.current_weather.time
      };
      

      // Envia dados meteorológicos para o frontend
      io.emit('dados-clima', clima);
      console.log("Emitido dados-clima:", clima);

    } catch (e) {
      console.error("Erro ao processar mensagem MQTT:", e.message);
    }
  }
=======
client.on('message', (topic, payload) => {
    if (topic === 'mapa') {
      try {
<<<<<<< Updated upstream
        const mensagem = JSON.parse(payload.toString());
        const { lat , long } = mensagem;
        registrosmapa.push(mensagem);
        console.log(`MQTT: Mapa atualizado - ${lat}: ${long}`);
=======
        const mensagem = payload.toString();
        mensagem.split(",");
        const lat = mensagem[0];
        const long = mensagem[1];
        const novoReg = new projeto_2({
              tipo: 'mapa',
              latitude: parseFloat(lat),
              longitude: parseFloat(long),
            });
            await novoReg.save();
            console.log('Novo registro:', novoReg);
        //registrosmapa.push(mensagem);
        console.log(`MQTT: Mapa atualizado - ${lat}: ${long}`);

        // Emite coordenadas para o frontend
        io.emit('nova-coordenada', { lat, lon: long });

        // Faz requisição à API de clima
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true`;
        const { data } = await axios.get(url);

        const clima = {
          temperatura: data.current_weather.temperature,
          vento: data.current_weather.windspeed,
          codigoTempo: data.current_weather.weathercode,
          horario: data.current_weather.time
        };

        // Envia dados meteorológicos para o frontend
        io.emit('dados-clima', clima);
        console.log("Emitido dados-clima:", clima);
        let registrosmapa = await projeto_2.find({tipo:'mapa'}).sort({dataRecebida:-1}).limit(limite);
        let registrostemp = await projeto_2.find({tipo:'temperatura'}).sort({dataRecebida:-1}).limit(limite);
        let registrosvento = await projeto_2.find({tipo:'velocidade'}).sort({dataRecebida:-1}).limit(limite);
        let registrosumidade = await projeto_2.find({tipo:'umidade'}).sort({dataRecebida:-1}).limit(limite);

>>>>>>> Stashed changes
      } catch (e) {
        console.error("Erro ao processar mensagem MQTT:", e.message);
      }

    }
<<<<<<< Updated upstream
>>>>>>> Stashed changes
    if (topic ==='temperatura'){
        try {
            const mensagem = JSON.parse(payload.toString());
            const { temperatura } = mensagem;
            registrostemp.push(mensagem);
            console.log(`MQTT: Temp atualizado - ${temperatura}`);
<<<<<<< Updated upstream
            
=======
>>>>>>> Stashed changes
          } catch (e) {
            console.error("Erro ao processar mensagem MQTT:", e.message);
          }
    }
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
    if (topic ==='umidade'){
        try {
            const mensagem = JSON.parse(payload.toString());
            const { umidade } = mensagem;
            registrosumidade.push(mensagem);
            console.log(`MQTT: Umidade atualizado - ${umidade}`);
          } catch (e) {
            console.error("Erro ao processar mensagem MQTT:", e.message);
          }
    }
    if (topic ==='sensor-de-vento'){
        try {
            const mensagem = JSON.parse(payload.toString());
            const { velocidade } = mensagem;
            registrosumidade.push(mensagem);
            console.log(`MQTT: Sensor vento atualizado - ${velocidade}`);
          } catch (e) {
            console.error("Erro ao processar mensagem MQTT:", e.message);
          }
=======
    
    if (topic === 'temperatura') {
      try {
        const mensagem = payload.toString();
        const temperatura = mensagem;
        const novoReg = new projeto_2({
              tipo: 'temperatura',
              valor: parseFloat(temperatura),
            });
            await novoReg.save();
            console.log('Novo registro:', novoReg);
        //registrostemp.push(mensagem);
        console.log(`MQTT: Temp atualizado - ${temperatura}`);
      } catch (e) {
        console.error("Erro ao processar mensagem MQTT:", e.message);
      }
    }
    
    if (topic === 'umidade') {
      try {
        const mensagem = payload.toString();
        const umidade = mensagem;
        //registrosumidade.push(mensagem);
            const novoReg = new projeto_2({
              tipo: 'umidade',
              valor: parseFloat(umidade),
            });
            await novoReg.save();
            console.log('Novo registro:', novoReg);
        console.log(`MQTT: Umidade atualizado - ${umidade}`);
      } catch (e) {
        console.error("Erro ao processar mensagem MQTT:", e.message);
      }
    }
    
    if (topic === 'sensor-de-vento') {
      try {
        const mensagem = payload.toString();
        const velocidade = mensagem;
        //registrosvento.push(mensagem);
        const novoReg = new projeto_2({
            tipo: 'velocidade',
            valor: parseFloat(velocidade),
            });
            await novoReg.save();
        console.log(`MQTT: Sensor vento atualizado - ${velocidade}`);
      } catch (e) {
        console.error("Erro ao processar mensagem MQTT:", e.message);
      }
>>>>>>> Stashed changes
    }
  });

<<<<<<< Updated upstream

<<<<<<< Updated upstream






=======
>>>>>>> Stashed changes
router.get('/', (req, res) => {
    //res.send('OI GRUPO 2')
    res.render('projeto2')
});

<<<<<<< Updated upstream
return router;
}
// Exporta o router
//module.exports = router;rs
=======
// Exporta o router
module.exports = (io) => {
  const router = express.Router();

  router.get("/", (req, res) => {
    io.emit("mensagem", "Nova conexão no projeto 2!");
    res.send("Projeto 2 conectado com Socket.IO");
=======
  // Rota principal do projeto 2
  router.get('/', (req, res) => {

    res.render('projeto2', {
      success: req.query.success,
      error: req.query.error,
      registrosmapa: registrosmapa,
      registrostemp: registrostemp,
      registrosvento: registrosvento,
      registrosumidade: registrosumidade,
      user: req.session.user
    });  
>>>>>>> Stashed changes
  });

  return router;
};
>>>>>>> Stashed changes
