// Importa o módulo Express e cria um roteador
const express = require("express")
const router = express.Router()

// Importa o módulo MQTT para comunicação com o broker
const mqtt = require('mqtt');
// Importa o módulo 'url' para trabalhar com URLs (não utilizado atualmente, mas pode ser útil)
const { fileURLToPath } = require('url');
// Importa o módulo 'path' para manipulação de caminhos de arquivos
const path = require("path")

// Conecta ao broker MQTT utilizando as credenciais fornecidas


const client = mqtt.connect('mqtt://igbt.eesc.usp.br', {
  username: 'mqtt',
  password: 'mqtt_123_abc'
});

// Define o tópico MQTT que será utilizado
const mqtt_topic = 'node';

// Configura o evento para quando uma mensagem for recebida em algum tópico inscrito
client.on('message', (mqtt_topic, message) => {
  console.log(`Received message on topic ${mqtt_topic}: ${message}`);
});

// Configura o evento para quando a conexão com o broker for estabelecida
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  console.log('Subscribing to node topic');
  // Se inscreve no tópico definido
  client.subscribe(mqtt_topic, (err) => {
    if (err) {
      console.error(`Error on subscribing to topic ${mqtt_topic}: ${err}`);
    }
    else {
      console.log(`Successfuly subscribed to topic: ${mqtt_topic}`);
    }
  });
});

// Importa o módulo express-fileupload para lidar com uploads de arquivos
const fileUpload = require("express-fileupload");
// Ativa o middleware para upload de arquivos no roteador
router.use(fileUpload());

// Rota GET para exibir a página de envio de arquivos
router.get("/", (req, res) => {
  res.render('send-files')
});

// Rota POST para processar o upload de arquivos
router.post("/upload", (req, res) => {
  // Verifica se algum arquivo foi enviado
  if (!req.files || Object.keys(req.files).length === 0) {
    // Re-renderiza a página de envio de arquivos com uma mensagem de erro
    return res.render("send-files", { error: "Nenhum arquivo foi enviado" });
  }
  
  // Recupera o arquivo enviado com o nome "file1"
  let uploadedFile = req.files.file1; 
  // Define o caminho onde o arquivo será armazenado na pasta "public/uploads"
  let uploadPath = path.join("public/uploads", uploadedFile.name); 

  // Move (salva) o arquivo para o caminho definido
  uploadedFile.mv(uploadPath, (err) => {
    if (err) return res.status(500).send(err);
        // Após o upload bem-sucedido, publica uma mensagem no tópico MQTT
        client.publish(mqtt_topic, `Arquivo ${uploadedFile.name} enviado com sucesso!`, (err) => {
          if (err) {
            console.error(`Erro ao publicar mensagem no tópico ${mqtt_topic}: ${err}`);
          } else {
            console.log(`Mensagem publicada no tópico ${mqtt_topic}`);
          }
        });
    
    // Após o upload bem-sucedido, renderiza a página de sucesso do upload e passa o nome do arquivo
    res.render("upload-success", { fileName: uploadedFile.name });
  });
});

// Exporta o roteador para ser utilizado em outras partes da aplicação
module.exports = router;