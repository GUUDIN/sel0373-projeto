const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://igbt.eesc.usp.br', {
  username: 'mqtt',
  password: 'mqtt_123_abc'
});

const topic = 'vaquinha';

client.on('connect', () => {
  console.log(`Conectado ao broker MQTT. Escutando o tópico: ${topic}`);
  client.subscribe(topic, (err) => {
    if (err) {
      console.error('Erro ao se inscrever no tópico:', err);
    }
  });
});

client.on('message', (topic, message) => {
  console.log(`Mensagem recebida no tópico ${topic}: ${message.toString()}`);
});