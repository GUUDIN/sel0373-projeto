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
      tension: 0.4
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
socket.on('nova-coordenada', ({ lat, lon }) => {
  console.log('Nova coordenada recebida:', { lat, lon });
  map.setView([lat, lon], 14);
  marker.setLatLng([lat, lon])
    .setPopupContent(`Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`)
    .openPopup();
});
const clima_echo = [
    'temperatura/echo',
    'umidade/echo',
    'sensor-de-vento/echo'
  ];

// ...existing code...

// 🌡️ Temperatura recebida
socket.on('temperatura/echo', ({ temperatura, horario }) => {
  document.getElementById("temperatura").innerText = temperatura;

  const tempElement = document.getElementById('card-temp');
  if (tempElement) tempElement.textContent = `${temperatura}°C`;

  historico.push({ temperatura, horario });
  if (historico.length > 50) historico.shift();
  updateChart();
});


// 💧 Umidade recebida
socket.on('umidade/echo', ({ umidade, horario }) => {
  const umidadeElement = document.getElementById('card-umidade');
  if (umidadeElement) umidadeElement.textContent = `${umidade}%`;
  historico.push({ umidade, horario });
  if (historico.length > 50) historico.shift();
  updateChart();
});

// 💨 Vento recebido
socket.on('sensor-de-vento/echo', ({ vento, horario }) => {
  const ventoElement = document.getElementById('card-vento');
  if (ventoElement) ventoElement.textContent = `${vento} m/s`;
  historico.push({ vento, horario });
  if (historico.length > 50) historico.shift();
  updateChart();
});

// ...existing code...

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


