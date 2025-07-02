// Projeto 2: Monitoramento Climático
const axios = require("axios");
const mqtt = require('mqtt');
const path = require("path");
const express = require("express");
const projeto_2 = require("../models/projeto_2"); // ALTERAÇÃO


module.exports = function(io) {

  const limite = 10;

  const router = express.Router();

  // Arrays para armazenar dados dos sensores
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
        client.publish('logs/proj2', `Erro ao se inscrever nos tópicos`);
      } else {
        console.log(`Inscrito com sucesso nos tópicos: ${mqtt_topics.join(', ')}`);
        client.publish('logs/proj2', `Inscrito com sucesso nos tópicos: ${mqtt_topics.join(', ')}`);
      }
    });
  });

  // Recebimento dos dados via MQTT 
  client.on('message', async (topic, payload) => {
    if (topic === 'mapa') {
      try {
        //const mensagem = payload.toString();
        //mensagem.split(",");
        //const lat = mensagem[0];
        //const long = mensagem[1];
        const mensagem = payload.toString();
        const [lat, long] = mensagem.split(',').map(parseFloat);
        const novoReg = new projeto_2({
              tipo: 'mapa',
              latitude: lat,
              longitude: long,
            });
            await novoReg.save();
            console.log('Novo registro:', novoReg);
        //registrosmapa.push(mensagem);
        //console.log(`MQTT: Mapa atualizado - ${latitude}: ${longitude}`);

        // Emite coordenadas para o frontend
        io.emit('nova-coordenada', { lat: lat, lon: long });
        registrosmapa.length = 0;
        registrosmapa.push(...await projeto_2.find({ tipo: 'mapa' }).sort({ dataRecebida: -1 }).limit(limite));
        // Faz requisição à API de clima
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&current_weather=true`;
        const { data } = await axios.get(url);

        const clima = {
          latitude: lat,
          longitude: long,
          //temperatura: data.current_weather.temperature,
          //vento: data.current_weather.windspeed,
          codigoTempo: data.current_weather.weathercode,
          horario: data.current_weather.time
        };

        // Envia dados meteorológicos para o frontend
        //io.emit('dados-clima', clima);
        //console.log("Emitido dados-clima:", clima);
        let registrosmapa = await projeto_2.find({tipo:'mapa'}).sort({dataRecebida:-1}).limit(limite);
        
      } catch (e) {
        console.error("Erro ao processar mensagem MQTT:", e.message);
      }
    }
    
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
        registrostemp.length = 0;
        registrostemp.push(...await projeto_2.find({ tipo: 'temperatura' }).sort({ dataRecebida: -1 }).limit(limite));

        //let registrostemp = await projeto_2.find({tipo:'temperatura'}).sort({dataRecebida:-1}).limit(limite);
        io.emit('temperatura/echo', { temperatura: temperatura, horario: new Date().toISOString() });
        //client.publish('temperatura/echo', `${temperatura}`);
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
        registrosumidade.length = 0;
        registrosumidade.push(...await projeto_2.find({ tipo: 'umidade' }).sort({ dataRecebida: -1 }).limit(limite));

        //let registrosumidade = await projeto_2.find({tipo:'umidade'}).sort({dataRecebida:-1}).limit(limite);
        //client.publish('umidade/echo', umidade);
        io.emit('umidade/echo', { umidade: umidade, horario: new Date().toISOString() });
        //console.log(`MQTT: Umidade atualizado - ${umidade}`);
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
            tipo: 'vento',
            valor: parseFloat(velocidade),
            });
            await novoReg.save();
            registrosvento.length = 0;
            registrosvento.push(...await projeto_2.find({ tipo: 'velocidade' }).sort({ dataRecebida: -1 }).limit(limite));

            //let registrosvento = await projeto_2.find({tipo:'velocidade'}).sort({dataRecebida:-1}).limit(limite);
            //client.publish('sensor-de-vento/echo', `${velocidade}`);
            io.emit('vento/echo', { velocidade, horario: new Date().toISOString() });


        console.log(`MQTT: Sensor vento atualizado - ${velocidade}`);
      } catch (e) {
        console.error("Erro ao processar mensagem MQTT:", e.message);
      }
    }
  });

  // Middleware para simular usuário se necessário
  router.use((req, res, next) => {
    if (!req.session.user) {
      req.session.user = { id: 1, username: 'testUser', project: 2 };
    }
    next();
  });

  // Rota principal do projeto 2
  router.get('/', (req, res) => {

    res.render('projeto2', {
      success: req.query.success,
      error: req.query.error,
      registrosmapa: registrosmapa,
      registrostemp: registrostemp,
      registrosvento: registrosvento,
      registrosumidade: registrosumidade,

      tempValue: registrostemp.length ? registrostemp[registrostemp.length - 1].temperatura : null,
      umidadeValue: registrosumidade.length ? registrosumidade[registrosumidade.length - 1].umidade : null,
      ventoValue: registrosvento.length ? registrosvento[registrosvento.length - 1].velocidade : null,
      user: req.session.user
    });  
  });

  return router;
};
