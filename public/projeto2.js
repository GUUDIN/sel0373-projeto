const socket = io();

// Mapa
const map = L.map('map').setView([-23.5505, -46.6333], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);
let marker = L.marker([-23.5505, -46.6333]).addTo(map)
  .bindPopup("Posição inicial")
  .openPopup();

// Histórico de dados
const historico = [];


// Chart.js: inicializa o gráfico
const ctx = document.getElementById('grafico')?.getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperatura',
      data: [],
      borderColor: 'orange',
      fill: false,
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Hora' } },
      y: { title: { display: true, text: 'Valor' } }
    }
  }
});

// 🛰️ Coordenadas recebidas
socket.on('nova-coordenada', ({ lat, lon }) => {
  map.setView([lat, lon], 14);
  marker.setLatLng([lat, lon])
    .setPopupContent(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`)
    .openPopup();
});

// 🌡️ Dados climáticos recebidos
socket.on('dados-clima', ({ temperatura, vento, umidade, horario }) => {
  const tempo = new Date(horario).toLocaleTimeString('pt-BR');

  // Atualiza cards
  document.getElementById('card-temp').textContent = `${temperatura} °C`;
  document.getElementById('card-vento').textContent = `${vento} m/s`;
  document.getElementById('card-umidade').textContent = `${umidade} %`;

  // Armazena no histórico
  historico.push({ temperatura, vento, umidade, horario });
  if (historico.length > 50) historico.shift();

  // Atualiza gráfico
  const eixoY = document.getElementById('eixoY')?.value || 'temperatura';
  const eixoX = document.getElementById('eixoX')?.value || 'tempo';

  chart.data.labels = historico.map(d => new Date(d.horario).toLocaleTimeString());
  chart.data.datasets[0].label = eixoY.charAt(0).toUpperCase() + eixoY.slice(1);
  chart.data.datasets[0].data = historico.map(d => d[eixoY]);
  chart.update();
});
