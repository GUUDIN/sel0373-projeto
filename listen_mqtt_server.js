const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://igbt.eesc.usp.br', {
  username: 'mqtt',
  password: 'mqtt_123_abc'
});

const mqtt_topics = [
  'logs/proj2',
  'logs/vaquinha'
];

client.subscribe(mqtt_topics);

client.on('message', (topic, message) => {
  console.log(`[LOG RECEBIDO] ${message.toString()}`);
});
