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

socket.on('dados-clima', ({ temperatura, vento, umidade, horario }) => {
  console.log('Dados climáticos recebidos:', { temperatura, vento, umidade, horario });
  
  const tempo = new Date(horario).toLocaleTimeString('pt-BR');

  // Update metric cards
  const tempElement = document.getElementById('card-temp');
  const ventoElement = document.getElementById('card-vento');
  const umidadeElement = document.getElementById('card-umidade');
  const climaElement = document.getElementById('clima-info');

  if (tempElement) tempElement.textContent = `${temperatura}°C`;
  if (ventoElement) ventoElement.textContent = `${vento} m/s`;
  if (umidadeElement) umidadeElement.textContent = `${umidade || '--'}%`;
  if (climaElement) climaElement.textContent = `Clima: ${temperatura}°C, Vento: ${vento} m/s, Umidade: ${umidade || '--'}%`;

  // Store in history
  historico.push({ temperatura, vento, umidade, horario });
  if (historico.length > 50) historico.shift();

  // Update chart
  updateChart();
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

// Simulate some initial data for demonstration
setTimeout(() => {
  // Simulate initial location
  socket.emit('test-location', { lat: -23.5505, lon: -46.6333 });
  
  // Simulate some climate data
  const simulatedData = {
    temperatura: 25 + Math.random() * 10,
    vento: 5 + Math.random() * 15,
    umidade: 50 + Math.random() * 40,
    horario: new Date().toISOString()
  };
  
  console.log('Simulando dados iniciais:', simulatedData);
}, 2000);
