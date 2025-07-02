const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://igbt.eesc.usp.br', {
  username: 'mqtt',
  password: 'mqtt_123_abc'
});

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

client.on('connect', () => {
  console.log('Conectado ao broker MQTT! Enviando dados a cada 2 segundos...');

  let count = 0;
  const maxCount = 100; // Envia 100 vezes e para (ajuste se quiser mais/menos)

  const interval = setInterval(() => {
    if (count >= maxCount) {
      clearInterval(interval);
      client.end();
      console.log('Envio finalizado.');
      return;
    }

    const lat = randomBetween(-23.570, -23.560);
    const long = randomBetween(-46.630, -46.620);
    const temperatura = randomBetween(15, 35).toFixed(1);
    const umidade = randomBetween(30, 90).toFixed(1);
    const velocidade = randomBetween(0, 25).toFixed(1);

    client.publish('mapa', `${lat},${long}`);

    client.publish('temperatura', temperatura);
    client.publish('umidade',  umidade );
    client.publish('sensor-de-vento', velocidade);

    console.log(`[${count + 1}] Dados enviados: mapa(${lat},${long}), temperatura(${temperatura}), umidade(${umidade}), vento(${velocidade})`);
    count++;
  }, 20); // 2000 ms = 2 segundos
});
