// Projeto 2 - Monitoramento Climático - JavaScript Client
const socket = io();

// Initialize map
const map = L.map('map').setView([-23.5505, -46.6333], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let marker = L.marker([-23.5505, -46.6333]).addTo(map)
  .bindPopup("Posição inicial")
  .openPopup();

// Data storage
//const historicoTemp = [];
//const historicoLoc = [];
//const historicoUm = [];
const historico = [];

// Initialize chart
const ctx = document.getElementById('grafico')?.getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Temperatura',
      data: [],
      borderColor: '#007AFF',
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      fill: true,
      tension: 0.4,
      spanGaps: true // Liga os pontos mesmo com alguns dados faltando
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ffffff'
        }
      }
    },
    scales: {
      x: { 
        title: { 
          display: true, 
          text: 'Hora',
          color: '#ffffff'
        },
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: { 
        title: { 
          display: true, 
          text: 'Valor',
          color: '#ffffff'
        },
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  }
});

// Socket event handlers
socket.on('nova-coordenada', ({ lat, long }) => {
  //client.publish('Nova coordenada recebida:', { lat, lon });
  map.setView([lat, long], 14);
  marker.setLatLng([lat, long])
    .setPopupContent(`Lat: ${lat.toFixed(7)}, Lon: ${long.toFixed(7)}`)
    .openPopup();

  historico.push({ lat, long, horario: new Date().toISOString() });
  if (historico.length > 50) historico.shift();
});
const clima_echo = [
    'temperatura/echo',
    'umidade/echo',
    'sensor-de-vento/echo'
  ];

// 🌡️ Temperatura recebida
socket.on('temperatura/echo', ({ temperatura, horario }) => {
  //document.getElementById("temperatura").innerText = temperatura;

  const tempElement = document.getElementById('card-temp');
  if (tempElement) tempElement.textContent = `${temperatura}°C`;

  historico.push({ temperatura, horario });
  //client.publish('temperatura/echo', { temperatura, horario });
  if (historico.length > 50) historico.shift();
  updateChart();
});


// 💧 Umidade recebida
socket.on('umidade/echo', ({ umidade, horario }) => {
  const umidadeElement = document.getElementById('card-umidade');
  if (umidadeElement) umidadeElement.textContent = `${umidade}%`;
  historico.push({ umidade, horario });
  //client.publish('umidade/echo', { umidade, horario });

  if (historico.length > 50) historico.shift();
  updateChart();
});

// 💨 Vento recebido
socket.on('vento/echo', ({ velocidade, horario }) => {
  const ventoElement = document.getElementById('card-vento');
  if (ventoElement) ventoElement.textContent = `${velocidade} m/s`;
  historico.push({ vento: velocidade, horario });

  //historico.push({ velocidade, horario });
  //client.publish('vento/echo', { velocidade, horario });

  if (historico.length > 50) historico.shift();
  updateChart();
});

// ================================================== //
// MQTT TOGGLE SWITCH CONTROL
// ================================================== //

document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('mqttToggle');
  const toggleStatus = document.getElementById('toggleStatus');

  if (toggleSwitch && toggleStatus) {
    toggleSwitch.addEventListener('change', function() {
      const isChecked = this.checked;
      
      // Update status display
      if (isChecked) {
        toggleStatus.textContent = 'Ativado';
        toggleStatus.className = 'toggle-status on';
      } else {
        toggleStatus.textContent = 'Desativado';
        toggleStatus.className = 'toggle-status off';
      }

      // Send MQTT message via Socket.IO
      socket.emit('mqttToggle', {
        state: isChecked,
        timestamp: new Date().toISOString()
      });

      console.log(`Toggle MQTT: ${isChecked ? 'ON' : 'OFF'}`);
    });
  }
});

// Listen for MQTT toggle responses
socket.on('mqttToggleResponse', function(data) {
  console.log('MQTT Toggle Response:', data);
  
  // You can add visual feedback here if needed
  if (data.success) {
    console.log('MQTT message sent successfully');
  } else {
    console.error('Failed to send MQTT message:', data.error);
  }
});

// Chart update function
function updateChart() {
  const eixoY = document.getElementById('eixoY')?.value || 'temperatura';
  const eixoX = document.getElementById('eixoX')?.value || 'tempo';

  chart.data.labels = historico.map(d => new Date(d.horario).toLocaleTimeString('pt-BR'));
  chart.data.datasets[0].label = eixoY.charAt(0).toUpperCase() + eixoY.slice(1);
  chart.data.datasets[0].data = historico.map(d => d[eixoY]);
  
  // Update chart colors based on data type
  switch(eixoY) {
    case 'temperatura':
      chart.data.datasets[0].borderColor = '#FF6B35';
      chart.data.datasets[0].backgroundColor = 'rgba(255, 107, 53, 0.1)';
      break;
    case 'umidade':
      chart.data.datasets[0].borderColor = '#007AFF';
      chart.data.datasets[0].backgroundColor = 'rgba(0, 122, 255, 0.1)';
      break;
    case 'vento':
      chart.data.datasets[0].borderColor = '#34C759';
      chart.data.datasets[0].backgroundColor = 'rgba(52, 199, 89, 0.1)';
      break;
  }
  
  chart.update();
}

// Tab functionality
document.addEventListener('DOMContentLoaded', function() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // Chart control event listeners
  const eixoYSelect = document.getElementById('eixoY');
  const eixoXSelect = document.getElementById('eixoX');
  
  if (eixoYSelect) {
    eixoYSelect.addEventListener('change', updateChart);
  }
  
  if (eixoXSelect) {
    eixoXSelect.addEventListener('change', updateChart);
  }
});


