const mqtt = require('mqtt');

// Configuração MQTT
const client = mqtt.connect('mqtt://igbt.eesc.usp.br', {
  username: 'mqtt',
  password: 'mqtt_123_abc'
});

const topic = 'vaquinha/echo';

// Dados de teste (pode trocar o identifier para simular outros animais)
const identifier = 'vaquinha1';  // <-- coloque aqui o ID do animal que já está cadastrado
const peso = Math.floor(Math.random() * 500) / 10 + 30;  // peso aleatório entre 30 e 80 kg (com 1 casa decimal)

client.on('connect', () => {
  console.log('Conectado ao broker MQTT');

  const payload = {
    identifier,
    peso
  };

  client.publish(topic, JSON.stringify(payload), () => {
    console.log(`Enviado: ID: ${identifier}, Peso: ${peso}kg`);
    client.end();
  });
});
