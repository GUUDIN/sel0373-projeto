// Conecta com o servidor via Socket.IO
const socket = io();

// Inicializa o mapa com Leaflet, centralizado inicialmente em SP
const map = L.map('map').setView([-23.5505, -46.6333], 13);

// Adiciona camada do OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


// Adiciona marcador inicial
let marker = L.marker([-23.5505, -46.6333]).addTo(map)
  .bindPopup("Posição inicial")
  .openPopup();

// Escuta coordenadas vindas via WebSocket
socket.on('nova-coordenada', ({ lat, lon }) => {
  console.log("Nova coordenada recebida:", lat, lon);
  
  // Centraliza o mapa na nova posição
  map.setView([lat, lon], 14);

  // Atualiza o marcador
  marker.setLatLng([lat, lon])
    .setPopupContent(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`)
    .openPopup();
});

socket.on('dados-clima', ({ temperatura, vento, codigoTempo, horario }) => {
  const climaBox = document.getElementById('clima-info');
  if (climaBox) {
    climaBox.innerHTML = `
      <div>
        <strong>Clima externo</strong><br>
        🌡️ ${temperatura} °C &nbsp;|&nbsp; 💨 ${vento} m/s<br>
        <small>${new Date(horario).toLocaleString()}</small>
      </div>
    `;
  }
});
