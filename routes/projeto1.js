// Importações
const express = require("express");
const router = express.Router();
const mqtt = require('mqtt');
const path = require("path");
const fileUpload = require("express-fileupload");

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
const mqtt_topic = 'vaquinha/echo';//recebe dados de id, peso. é subscribed
const mqtt_topic_send = 'vaquinha'; //envia dados id, allowed
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
  if (topic === 'vaquinha/echo') {
    try {
      const mensagem = JSON.parse(payload.toString());
      const { identifier, peso } = mensagem;

      if (identifier && peso != null) {
        pesosPorIdentificador[identifier] = {
          peso,
          dataAtualizacao: new Date().toISOString()
        };
        console.log(`MQTT: Peso atualizado - ${identifier}: ${peso}kg`);
        client.publish('logs/vaquinha',`MQTT: Peso atualizado - ${identifier}: ${peso}kg`);
        //console.log("Emitindo socket pesoAtualizado:", { identifier, peso });
        io.emit('pesoAtualizado', { identifier, peso });
      }
    } catch (e) {
      console.error("Erro ao processar mensagem MQTT:", e.message);
    }
  }
});


// Middleware de teste para simular sessão de usuário caso login dê errado tirar fim do projeto
router.use((req, res, next) => {
  if (!req.session.user) {
    req.session.user = { id: 1, username: 'vitorinha123_noUser' }; 
  }
  next();
});

// Rota GET principal do projeto
router.get('/', (req, res) => {
  res.render('projeto1', {
    success: req.query.success,
    error: req.query.error,
    registros: registrosProjeto1,
    user: req.session.user
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
    dataPesoAtualizado: registroPeso?.dataAtualizacao || "Não atualizado",
    registradoPor: req.session.user.username,
    data: new Date().toISOString()
  };
  
  if (existente) {
    existente.allowed = allowed;
    existente.peso = peso;
    existente.registradoPor = req.session.user.username;
    existente.data = new Date().toISOString();
    console.log('Registro atualizado:', existente);
    client.publish('logs/vaquinha','Registro atualizado:', existente);
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
    client.publish('logs/vaquinha','Novo registro:', novo);
  }


  // Envia mensagem MQTT com 'id,allowed'

  const mensagemMQTT = JSON.stringify({ identifier, allowed });
  client.publish(mqtt_topic_send, mensagemMQTT, {}, (err) => {
    if (err){ 
      console.error('Erro ao enviar mensagem MQTT:', err);
      //client.publish('logs/vaquinha', `Erro ao enviar mensagem MQTT:'`);
    }
    else {
      //console.log(`Mensagem enviada via MQTT: ${mensagemMQTT}`);
      client.publish('logs/vaquinha', `Mensagem enviada via MQTT: ${mensagemMQTT}`);
  }

  });

  res.redirect('/projeto1');
});

// Rota para excluir um animal pelo identifier
router.post('/delete/:identifier', (req, res) => {
  const { identifier } = req.params;

  const index = registrosProjeto1.findIndex(r => r.identifier === identifier);
  if (index !== -1) {
    registrosProjeto1.splice(index, 1);
    //console.log(`Animal ${identifier} removido.`);
    client.publish('logs/vaquinha', `Animal ${identifier} removido.`);

  } else {
    //console.log(`Animal ${identifier} não encontrado para remoção.`);
    client.publish('logs/vaquinha', `Animal ${identifier} não encontrado para remoção.`);
  }

  res.redirect('/projeto1');
});

// Rota GET para ver os registros como JSON
router.get('/registered', (req, res) => {
  res.json(registrosProjeto1);
});

// Exporta o router
//module.exports = router;
return router;
}