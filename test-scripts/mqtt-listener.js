// mqtt-listener.js
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://igbt.eesc.usp.br', {
  username: 'mqtt',
  password: 'mqtt_123_abc'
});
const topics = ['mapa', 'temperatura', 'umidade', 'sensor-de-vento'];
const topics_front = ['mapa/echo', 'temperatura/echo', 'umidade/echo', 'sensor-de-vento/echo', 'teste'];

client.on('connect', () => {
  client.subscribe(topics_front, () => console.log('Escutando tópicos:', topics_front));
});
client.on('message', (topic, msg) => {
  console.log(`Recebido em ${topic}: ${msg.toString()}`);
});