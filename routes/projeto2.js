// Importações
const express = require("express");
const router = express.Router();
const mqtt = require('mqtt');
const path = require("path");

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
client.on('message', (topic, payload) => {
    if (topic === 'mapa') {
      try {
        const mensagem = JSON.parse(payload.toString());
        const { lat , long } = mensagem;
        registrosmapa.push(mensagem);
        console.log(`MQTT: Mapa atualizado - ${lat}: ${long}`);
      } catch (e) {
        console.error("Erro ao processar mensagem MQTT:", e.message);
      }

    }
    if (topic ==='temperatura'){
        try {
            const mensagem = JSON.parse(payload.toString());
            const { temperatura } = mensagem;
            registrostemp.push(mensagem);
            console.log(`MQTT: Temp atualizado - ${temperatura}`);
          } catch (e) {
            console.error("Erro ao processar mensagem MQTT:", e.message);
          }
    }
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
    }
  });








router.get('/', (req, res) => {
    //res.send('OI GRUPO 2')
    res.render('projeto2')
});


// Exporta o router
module.exports = router;