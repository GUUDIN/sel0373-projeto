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
    'sensores/mapa',
    'sensores/temperatura',
    'sensores/umidade',
    'sensores/vento'
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
    if (topic === 'sensores/mapa') {
      try {
        const mensagem = payload.toString();
        const [lat, long] = mensagem.split(',').map(parseFloat);
        const novoReg = new projeto_2({
              tipo: 'mapa',
              latitude: lat,
              longitude: long,
              user: socket.request.session.user.username,
            });
            await novoReg.save();
            io.emit('dados-recentes/mapa', novoReg);
            console.log('Novo registro:', novoReg);


        // Emite coordenadas para o frontend
        io.emit('nova-coordenada', { lat: lat, long: long });
        //registrosmapa.length = 0;
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
    
    if (topic === 'sensores/temperatura') {
      try {
        const mensagem = payload.toString();
        const temperatura = mensagem;
        const novoReg = new projeto_2({
              tipo: 'temperatura',
              valor: parseFloat(temperatura),
              user: socket.request.session.user.username,
            });
            await novoReg.save();
            console.log('Novo registro:', novoReg);
            io.emit('dados-recentes/temperatura', novoReg);

        //registrostemp.push(mensagem);
        //registrostemp.length = 0;
        registrostemp.push(...await projeto_2.find({ tipo: 'temperatura' }).sort({ dataRecebida: -1 }).limit(limite));

        //let registrostemp = await projeto_2.find({tipo:'temperatura'}).sort({dataRecebida:-1}).limit(limite);
        io.emit('temperatura/echo', { temperatura: temperatura, horario: new Date().toISOString() });
        //client.publish('temperatura/echo', `${temperatura}`);
        console.log(`MQTT: Temp atualizado - ${temperatura}`);
      } catch (e) {
        console.error("Erro ao processar mensagem MQTT:", e.message);
      }
    }
    
    if (topic === 'sensores/umidade') {
      try {
        const mensagem = payload.toString();
        const umidade = mensagem;
        //registrosumidade.push(mensagem);
            const novoReg = new projeto_2({
              tipo: 'umidade',
              valor: parseFloat(umidade),
              user: socket.request.session.user.username,
            });
            await novoReg.save();
            io.emit('dados-recentes/umidade', novoReg);
            console.log('Novo registro:', novoReg);

        registrosumidade.push(...await projeto_2.find({ tipo: 'umidade' }).sort({ dataRecebida: -1 }).limit(limite));
        await projeto_2.find({ tipo: 'umidade' }).sort({ dataRecebida: -1 }).limit(limite);


        io.emit('umidade/echo', { umidade: umidade, horario: new Date().toISOString() });
        //console.log(`MQTT: Umidade atualizado - ${umidade}`);
      } catch (e) {
        console.error("Erro ao processar mensagem MQTT:", e.message);
      }
    }
    
    if (topic === 'sensores/vento') {
      try {
        const mensagem = payload.toString();
        const vento = mensagem;
        //registrosvento.push(mensagem);
        const novoReg = new projeto_2({
            tipo: 'vento',
            valor: parseFloat(vento),
            user: socket.request.session.user.username,
            });
            await novoReg.save();
            io.emit('dados-recentes/vento', novoReg);

            //registrosvento.length = 0;
            registrosvento.push(...await projeto_2.find({ tipo: 'vento' }).sort({ dataRecebida: -1 }).limit(limite));

            //let registrosvento = await projeto_2.find({tipo:'velocidade'}).sort({dataRecebida:-1}).limit(limite);
            //client.publish('vento/echo', `${velocidade}`);
            io.emit('vento/echo', { vento: vento, horario: new Date().toISOString() });


        console.log(`MQTT: Sensor vento atualizado - ${vento}`);
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
/*
  // Rota principal do projeto 2
  router.get('/', (req, res) => {

    res.render('projeto2', {
      success: req.query.success,
      error: req.query.error,
      registrosmapa: registrosmapa,
      registrostemp: registrostemp,
      registrosvento: registrosvento,
      registrosumidade: registrosumidade,

      //tempValue: registrostemp.length ? registrostemp[registrostemp.length - 1].temperatura : null,
      //umidadeValue: registrosumidade.length ? registrosumidade[registrosumidade.length - 1].umidade : null,
      //ventoValue: registrosvento.length ? registrosvento[registrosvento.length - 1].velocidade : null,
      
      tempValue: registrostemp.length ? registrostemp[0].valor : null,
      umidadeValue: registrosumidade.length ? registrosumidade[0].valor : null,
      ventoValue: registrosvento.length ? registrosvento[0].valor : null,

      user: req.session.user
    });  
  });
 */

  //const Projeto_2 = require('../models/projeto_2');

router.get('/', async (req, res) => {
  try {
    const limite = 2; // Limite de registros a serem exibidos
    const user = req.session.user.username;

    const registrosmapa = await projeto_2.find({ tipo: 'mapa', user }).sort({ dataRecebida: -1 }).limit(limite);
    const registrostemp = await projeto_2.find({ tipo: 'temperatura', user }).sort({ dataRecebida: -1 }).limit(limite);
    const registrosumidade = await projeto_2.find({ tipo: 'umidade', user }).sort({ dataRecebida: -1 }).limit(limite);
    const registrosvento = await projeto_2.find({ tipo: 'vento', user }).sort({ dataRecebida: -1 }).limit(limite);
    res.render('projeto2', {
      registrosmapa,
      registrostemp,
      registrosumidade,
      registrosvento,

      tempValue: registrostemp.length ? registrostemp[0].valor : null,
      umidadeValue: registrosumidade.length ? registrosumidade[0].valor : null,
      ventoValue: registrosvento.length ? registrosvento[0].valor : null,

      user: req.session.user
    });
  } catch (error) {
    console.error('Erro ao carregar dados do projeto 2:', error);
    res.render('projeto2', {
      error: 'Erro ao carregar os dados recentes.',
      registrosmapa: [],
      registrostemp: [],
      registrosumidade: [],
      registrosvento: [],
      user: req.session.user
    });
  }
});



  return router;
};
