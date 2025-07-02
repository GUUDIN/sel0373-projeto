// Projeto 2: Monitoramento Climático
const axios = require("axios");
const mqtt = require('mqtt');
const path = require("path");
const express = require("express");
const projeto_2 = require("../models/projeto_2"); // ALTERAÇÃO
//const projeto2 = require("./routes/projeto2")(io, connectedUsers);


module.exports = function(io, connectedUsers){

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
  io.on('connection', (socket) => {
  const username = socket?.request?.session?.user?.username || 'desconhecido';

  console.log(`[Socket conectado] Usuário: ${username}`);

  client.on('message', async (topic, payload) => {
    const mensagem = payload.toString();

    try {
      if (topic === 'sensores/mapa') {
        const [lat, long] = mensagem.split(',').map(parseFloat);

        const novoReg = new projeto_2({
          tipo: 'mapa',
          latitude: lat,
          longitude: long,
          usuario: username,
        });

        await novoReg.save();
        io.emit('dados-recentes/mapa', novoReg);
        io.emit('nova-coordenada', { lat, long });

      } else if (topic === 'sensores/temperatura') {
        const temperatura = parseFloat(mensagem);
        const novoReg = new projeto_2({
          tipo: 'temperatura',
          valor: temperatura,
          usuario: username,
        });

        await novoReg.save();
        io.emit('dados-recentes/temperatura', novoReg);
        io.emit('temperatura/echo', { temperatura, horario: new Date().toISOString() });

      } else if (topic === 'sensores/umidade') {
        const umidade = parseFloat(mensagem);
        const novoReg = new projeto_2({
          tipo: 'umidade',
          valor: umidade,
          usuario: username,
        });

        await novoReg.save();
        io.emit('dados-recentes/umidade', novoReg);
        io.emit('umidade/echo', { umidade, horario: new Date().toISOString() });

      } else if (topic === 'sensores/vento') {
        const vento = parseFloat(mensagem);
        const novoReg = new projeto_2({
          tipo: 'vento',
          valor: vento,
          usuario: username,
        });

        await novoReg.save();
        io.emit('dados-recentes/vento', novoReg);
        io.emit('vento/echo', { vento, horario: new Date().toISOString() });
      }

    } catch (error) {
      console.error(`[Erro MQTT] ${topic}: ${error.message}`);
    }
  });

socket.on('mqttToggle', (data) => {
    const comando = data.comando || (data.state ? 'liga' : 'desliga');

    if (client && client.connected) {
      client.publish('teste', comando);
      console.log(`[${username}] MQTT publicado em 'teste': ${comando}`);
    }

    socket.emit('mqttToggleResponse', {
      success: true,
      comando,
      timestamp: new Date().toISOString()
    });
  });
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
    const usuario = req.session.user.username;

    const registrosmapa = await projeto_2.find({ tipo: 'mapa', usuario }).sort({ dataRecebida: -1 }).limit(limite);
    const registrostemp = await projeto_2.find({ tipo: 'temperatura', usuario }).sort({ dataRecebida: -1 }).limit(limite);
    //const registrostemp = await projeto_2.find({ tipo: 'temperatura' }).sort({ dataRecebida: -1 }).limit(limite);
    const registrosumidade = await projeto_2.find({ tipo: 'umidade', usuario }).sort({ dataRecebida: -1 }).limit(limite);
    const registrosvento = await projeto_2.find({ tipo: 'vento', usuario }).sort({ dataRecebida: -1 }).limit(limite);
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

router.get('/api/grafico', async (req, res) => {
  try {
    const tipo = req.query.tipo || 'temperatura'; // 'umidade', 'vento'
    const limite = parseInt(req.query.limite) || 50;

    const usuario = req.session.user?.username;
    const query = { tipo };
    if (usuario) query.usuario = usuario;

    const dados = await projeto_2.find(query)
      .sort({ dataRecebida: -1 })
      .limit(limite)
      .select('valor dataRecebida -_id');

    // Inverte para ordem cronológica
    res.json(dados.reverse());
  } catch (err) {
    console.error("Erro ao obter dados do gráfico:", err);
    res.status(500).json({ error: 'Erro ao obter dados do gráfico' });
  }
});

  return router;
};
