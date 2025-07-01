// mqtt-listener.js
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://igbt.eesc.usp.br', {
  username: 'mqtt',
  password: 'mqtt_123_abc'
});
const topics = ['mapa', 'temperatura', 'umidade', 'sensor-de-vento'];
client.on('connect', () => {
  client.subscribe(topics, () => console.log('Escutando tópicos:', topics));
});
client.on('message', (topic, msg) => {
  console.log(`Recebido em ${topic}: ${msg.toString()}`);
});