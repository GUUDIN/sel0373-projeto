// Importações
const express = require("express");
const mqtt = require('mqtt');
const path = require("path");
const fileUpload = require("express-fileupload");

// Importa a configuração de projetos
const { getActiveProjects } = require('../config/projects');

// Export function that receives io instance
module.exports = function(io) {
  const router = express.Router();
  
  // Vetor para armazenar os registros
  const registrosProjeto1 = [];
  
  // Variável para guardar o último peso recebido
  const pesosPorIdentificador = {};
  
  // Conexão MQTT
  const client = mqtt.connect('mqtt://igbt.eesc.usp.br', {
    username: 'mqtt',
    password: 'mqtt_123_abc'
  });
  
  // Definição do topico associado ao projeto 1
  const mqtt_topic = 'vaquinha';

// Qnd conectar ao broker MQTT ...
client.on('connect', () => {
  client.subscribe(mqtt_topic, (err) => {
    if (err) {
      console.error(`Erro ao se inscrever no tópico ${mqtt_topic}: ${err}`);
    } else {
      console.log(`Inscrito com sucesso no tópico: ${mqtt_topic}`);
    }
  });
});

//Recebimento dos dados via mqtt 
client.on('message', (topic, payload) => {
  try {
    const mensagem = JSON.parse(payload.toString());
    const { identifier, peso } = mensagem;

    if (identifier && peso != null) {
      pesosPorIdentificador[identifier] = {
        peso,
        dataAtualizacao: new Date().toISOString()
      };
      console.log(`MQTT: Peso atualizado - ${identifier}: ${peso}kg`);
      
      // Emit real-time update via Socket.IO
      io.emit('peso-atualizado', {
        identifier,
        peso,
        dataAtualizacao: new Date().toISOString()
      });
    }
  } catch (e) {
    console.error("Erro ao processar mensagem MQTT:", e.message);
  }
});

// Middleware de teste para simular sessão de usuário caso login dê errado
router.use((req, res, next) => {
  if (!req.session.user) {
    req.session.user = { id: 1, username: 'vitorinha123_noUser' }; 
  }
  next();
});

// Rota GET principal do projeto
router.get('/', (req, res) => {
  const activeProjects = getActiveProjects();
  res.render('projeto1', {
    success: req.query.success,
    error: req.query.error,
    registros: registrosProjeto1,
    user: req.session.user,
    projects: activeProjects
  });  
});

// Rota POST para registrar um animal
router.post('/register', (req, res) => {
  const { identifier, allowed } = req.body;

  if (!req.session.user) {
    return res.status(401).send('Usuário não autenticado');
  }

  const peso = pesosPorIdentificador[identifier] || "Não recebido";
  const existente = registrosProjeto1.find(reg => reg.identifier === identifier);
  const registroPeso = pesosPorIdentificador[identifier];
 
  const novoRegistro = {
    identifier,
    allowed,
    peso: registroPeso?.peso || "Não recebido",
    dataPesoAtualizado: registroPeso?.dataAtualizacao || null,
    registradoPor: req.session.user.username,
    data: new Date().toISOString()
  };
  
  if (existente) {
    existente.allowed = allowed;
    existente.peso = peso;
    existente.registradoPor = req.session.user.username;
    existente.data = new Date().toISOString();
    console.log('Registro atualizado:', existente);
    
    // Emit real-time update via Socket.IO
    io.emit('registro-atualizado', existente);
  } else {
    const novo = {
      identifier,
      allowed,
      peso,
      registradoPor: req.session.user.username,
      data: new Date().toISOString()
    };
    registrosProjeto1.push(novo);
    console.log('Novo registro:', novo);
    
    // Emit real-time update via Socket.IO
    io.emit('novo-registro', novo);
  }


  // Envia mensagem MQTT com 'id,allowed'
  const mensagemMQTT = JSON.stringify({ identifier, allowed });
  client.publish(mqtt_topic, mensagemMQTT, {}, (err) => {
    if (err) console.error('Erro ao enviar mensagem MQTT:', err);
    else console.log(`Mensagem enviada via MQTT: ${mensagemMQTT}`);

  });

  res.redirect('/projeto1');
});

// Rota para excluir um animal pelo identifier
router.post('/delete/:identifier', (req, res) => {
  const { identifier } = req.params;

  const index = registrosProjeto1.findIndex(r => r.identifier === identifier);
  if (index !== -1) {
    registrosProjeto1.splice(index, 1);
    console.log(`Animal ${identifier} removido.`);
  } else {
    console.log(`Animal ${identifier} não encontrado para remoção.`);
  }

  res.redirect('/projeto1');
});

// Rota GET para ver os registros como JSON
router.get('/registered', (req, res) => {
  res.json(registrosProjeto1);
});

// Return the router
return router;
};
