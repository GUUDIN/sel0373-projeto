// Importações
const express = require("express");
const router = express.Router();
const mqtt = require('mqtt');
const path = require("path");
const Projeto1 = require('../models/projeto_1');

const fileUpload = require("express-fileupload");
const { getActiveProjects } = require('../config/projects');

module.exports = function(io) {

const router = express.Router();
// Importa a configuração de projetos

// Vetor para armazenar os registros
const registrosProjeto1 = [];

// Objeto para armazenar os pesos recebidos via MQTT
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
client.on('message', async(topic, payload) => {
  if (topic === mqtt_topic) {
    try {
      const mensagem = JSON.parse(payload.toString());
      const { identifier, peso } = mensagem;

      if (identifier && peso != null) {
        pesosPorIdentificador[identifier] = {
          peso,
          dataAtualizacao: new Date().toISOString()
        };

        await Projeto1.findOneAndUpdate({identifier: identifier},{peso:peso, dataPesoAtualizado: new Date().toISOString()});
        
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

 
// Middleware de teste para simular sessão de usuário caso login dê errado
router.use((req, res, next) => {
 if (!req.session.user) {
 req.session.user = { id: 1, username: 'vitorinha123_noUser' };
 }
 next();
});


// Rota GET principal do projeto
router.get('/', async(req, res) => {
  const activeProjects = getActiveProjects();
  try {
  const registros = await Projeto1.find(); 
  res.render('projeto1', {
    success: req.query.success,
    error: req.query.error,
    registros: registrosProjeto1,
    //registros: registros, 
    user: req.session.user,
    projects: activeProjects
  });  
   } catch (err) {
      console.error("Erro ao buscar registros do banco:", err);
   res.status(500).send("Erro ao carregar registros");
 }
 });


router.post('/register', async (req, res) => {
  const { identifier, allowed } = req.body;

  if (!req.session.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  const registroPeso = pesosPorIdentificador[identifier];

  try {
    let existente = await Projeto1.findOne({ identifier });

    if (existente) {
      existente.allowed = allowed;
      if (registroPeso?.peso) {
        existente.peso = registroPeso.peso;
        existente.dataPesoAtualizado = registroPeso.dataAtualizacao;
      }
      existente.registradoPor = req.session.user.username;
      existente.data = new Date().toISOString();

      await existente.save();
      //if(allowed == 'sim'){
      io.emit('registroAtualizado', {
        identifier,
        allowed,
        peso: existente.peso,
        registradoPor: req.session.user.username,
        data: existente.data
      });
      

    const allowedBinary = existente.allowed === 'sim' ? 0 : 1;
    client.publish('vaquinha', `${existente.identifier}, ${allowedBinary}`);
     // }


      return res.status(200).json({ message: 'Registro atualizado com sucesso' });
    } else {
      // novo
      const novoRegistro = new Projeto1({
        identifier,
        allowed,
        peso: registroPeso?.peso || 'Não recebido',
        registradoPor: req.session.user.username,
        data: new Date().toISOString()
      });

      await novoRegistro.save();

      io.emit('novoRegistro', {
        identifier,
        allowed,
        peso: typeof novoRegistro.peso === 'object' && novoRegistro.peso !== null ? novoRegistro.peso.peso : novoRegistro.peso,
        registradoPor: novoRegistro.registradoPor,
        data: novoRegistro.data
      });


      
      const allowedBinary = allowed === 'sim' ? 0 : 1;
      client.publish(mqtt_topic_send, `${identifier}, ${allowedBinary}`);
      return res.status(200).json({ message: 'Animal cadastrado com sucesso' });
    }

  } catch (err) {
    console.error('Erro no /register:', err);
    client.publish(mqtt_topic_send, 'erro no registro');
    return res.status(500).json({ error: 'Erro ao processar o registro' });
  }
});



router.post('/delete/:identifier', async (req, res) => {
  const { identifier, allowed} = req.params;

  try {
    const result = await Projeto1.deleteOne({ identifier });

    if (result.deletedCount === 1) {
      console.log(`Animal ${identifier} removido.`);
      const allowedBinary = allowed == 0;;
      client.publish(mqtt_topic_send, `${identifier}, ${allowedBinary}`);

      io.emit('registroRemovido', { identifier });
      return res.status(200).json({ message: 'Animal removido com sucesso' });
    } else {
      console.warn(`Animal ${identifier} não encontrado.`);
      return res.status(404).json({ error: 'Animal não encontrado para exclusão' });
    }
  } catch (err) {
    console.error('Erro ao excluir animal:', err);
    return res.status(503).json({ error: 'Erro ao excluir animal' });
  }
});



// Rota GET para ver os registros como JSON
 router.get('/registered', async (req, res) => {
 try {
 const registros = await Projeto1.find(); // Busca todos os registros no banco
 res.json(registros);
 } catch (err) {
 res.status(500).send('Erro ao buscar registros');
 }
});

return router;
}