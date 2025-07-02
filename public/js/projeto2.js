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
const historicoTemp = [];
const historicoUmidade = [];
const historicoVento = [];
const historicoMapa = [];


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
    .setPopupContent(`Lat: ${lat.toFixed(4)}, Lon: ${long.toFixed(4)}`)
    .openPopup();

  historicoMapa.push({ lat, long, horario: new Date().toISOString() });
  if (historicoMapa.length > 50) historicoMapa.shift();
  historico.push({ latitude: lat, longitude: long , horario: new Date().toISOString() });
  if (historico.length > 50) historico.shift();
  
  // Adiciona ao sistema de registros recentes
  adicionarRegistro('mapa', { latitude: lat, longitude: long });
});


// 🌡️ Temperatura recebida
socket.on('temperatura/echo', ({ temperatura, horario }) => {
  //document.getElementById("temperatura").innerText = temperatura;

  const tempElement = document.getElementById('card-temp');
  if (tempElement) tempElement.textContent = `${temperatura}°C`;

  historicoTemp.push({ temperatura: temperatura, horario });
  //client.publish('temperatura/echo', { temperatura, horario });
  if (historicoTemp.length > 50) historicoTemp.shift();

  historico.push({ temperatura: temperatura, horario: new Date().toISOString() });
  if (historico.length > 50) historico.shift();
  
  // Adiciona ao sistema de registros recentes
  adicionarRegistro('temperatura', { valor: temperatura, horario });
  
  updateChart();
});


// 💧 Umidade recebida
socket.on('umidade/echo', ({ umidade, horario }) => {
  const umidadeElement = document.getElementById('card-umidade');
  if (umidadeElement) umidadeElement.textContent = `${umidade}%`;
  historicoUmidade.push({ umidade, horario });
  //client.publish('umidade/echo', { umidade, horario });

  if (historicoUmidade.length > 50) historicoUmidade.shift();

  historico.push({ umidade: umidade, horario: new Date().toISOString() });
  if (historico.length > 50) historico.shift();
  
  // Adiciona ao sistema de registros recentes
  adicionarRegistro('umidade', { valor: umidade, horario });
  
  updateChart();
});

// 💨 Vento recebido
socket.on('vento/echo', ({ vento, horario }) => {
  const ventoElement = document.getElementById('card-vento');
  if (ventoElement) ventoElement.textContent = `${vento} m/s`;
  historicoVento.push({ vento: vento, horario });

  //historico.push({ velocidade, horario });
  //client.publish('vento/echo', { velocidade, horario });
  
  if (historicoVento.length > 50) historicoVento.shift();
  historico.push({ vento: vento, horario: new Date().toISOString() });
  if (historico.length > 50) historico.shift();
  
  // Adiciona ao sistema de registros recentes
  adicionarRegistro('vento', { valor: vento, horario });
  
  updateChart();
});

// ================================================== //
// MQTT TOGGLE SWITCH CONTROL
// ================================================== //
/*
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
*/
// Listen for MQTT toggle responses
socket.on('mqttToggleResponse', function(data) {
  console.log('MQTT Toggle Response:', data);
  
  const toggleSwitch = document.getElementById('mqttToggle');
  const toggleStatus = document.getElementById('toggleStatus');
  
  if (toggleSwitch && toggleStatus) {
    toggleProcessing = false;
    toggleSwitch.disabled = false;
    
    if (data.success) {
      console.log('MQTT message sent successfully');
      const isOn = data.comando === 'liga';
      toggleStatus.textContent = isOn ? 'Ativado' : 'Desativado';
      toggleStatus.className = isOn ? 'toggle-status on' : 'toggle-status off';
    } else {
      console.error('Failed to send MQTT message:', data.error);
      // Reverte o estado do toggle em caso de erro
      toggleSwitch.checked = !toggleSwitch.checked;
      toggleStatus.textContent = 'Erro na comunicação';
      toggleStatus.className = 'toggle-status error';
      
      // Remove o erro após 2 segundos
      setTimeout(() => {
        const isOn = toggleSwitch.checked;
        toggleStatus.textContent = isOn ? 'Ativado' : 'Desativado';
        toggleStatus.className = isOn ? 'toggle-status on' : 'toggle-status off';
      }, 2000);
    }
  }
});

// Chart update function
async function updateChart() {
  const eixoY = document.getElementById('eixoY')?.value || 'temperatura';
  const limite = document.getElementById('limiteAmostras')?.value || 50;

  try {
    const res = await fetch(`/projeto2/api/grafico?tipo=${eixoY}&limite=${limite}`);
    const dados = await res.json();

    chart.data.labels = dados.map(d => new Date(d.dataRecebida).toLocaleTimeString('pt-BR'));
    chart.data.datasets[0].label = eixoY.charAt(0).toUpperCase() + eixoY.slice(1);
    chart.data.datasets[0].data = dados.map(d => parseFloat(d.valor));

    switch (eixoY) {
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
  } catch (error) {
    console.error('Erro ao atualizar gráfico:', error);
  }
}


/*
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
*/

document.addEventListener('DOMContentLoaded', function() {
  // 1. Tabs
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      const targetContent = document.getElementById(`tab-${targetTab}`);
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // 2. Chart controls
  const eixoYSelect = document.getElementById('eixoY');
  const eixoXSelect = document.getElementById('eixoX');

  const limiteSelect = document.getElementById('limiteAmostras');
  if (limiteSelect) limiteSelect.addEventListener('change', updateChart);


  if (eixoYSelect) eixoYSelect.addEventListener('change', updateChart);
  if (eixoXSelect) eixoXSelect.addEventListener('change', updateChart);

  // 3. MQTT Toggle - MELHORADO
  const toggleSwitch = document.getElementById('mqttToggle');
  const toggleStatus = document.getElementById('toggleStatus');
  
  let toggleProcessing = false;
  let debounceTimer = null;

  if (toggleSwitch && toggleStatus) {
    toggleSwitch.addEventListener('change', function () {
      // Previne múltiplos cliques rápidos
      if (toggleProcessing) {
        this.checked = !this.checked; // Reverte o estado
        return;
      }

      // Debounce para evitar múltiplas requisições
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const isChecked = this.checked;
        const comando = isChecked ? 'liga' : 'desliga';

        toggleProcessing = true;
        
        // Feedback visual imediato
        toggleStatus.textContent = 'Processando...';
        toggleStatus.className = 'toggle-status processing';
        toggleSwitch.disabled = true;

        // Envia o comando via socket
        socket.emit('mqttToggle', {
          state: isChecked,
          comando: comando,
          timestamp: new Date().toISOString(),
          userId: socket.id // Adiciona ID do socket para identificação
        });

        console.log(`Toggle MQTT: ${comando}`);

        // Timeout de segurança (remove o loading após 3 segundos)
        setTimeout(() => {
          if (toggleProcessing) {
            toggleProcessing = false;
            toggleSwitch.disabled = false;
            toggleStatus.textContent = isChecked ? 'Ativado' : 'Desativado';
            toggleStatus.className = isChecked ? 'toggle-status on' : 'toggle-status off';
          }
        }, 3000);
      }, 150); // Debounce de 150ms
    });
  }


  // 4. CHAMADA QUE IMPORTA: atualiza o gráfico com os dados salvos na DB
  updateChart();
});


const recentes = {
  mapa: [],
  temperatura: [],
  umidade: [],
  vento: []
};

// Função para limitar a 5
function adicionarRegistro(tipo, registro) {
  recentes[tipo].push(registro);
  if (recentes[tipo].length > 2) {
    recentes[tipo].shift(); // Remove o mais antigo
  }
  renderRecentes(tipo);
}


function renderRecentes(tipo) {
  const container = document.querySelector(`#tab-${tipo} .data-list`);
  if (!container) return;

  container.innerHTML = ''; // Limpa os registros antigos

  const dados = [...recentes[tipo]].reverse(); // Mostrar do mais recente ao mais antigo

  if (dados.length === 0) {
    container.innerHTML = `<p class="empty-state">Nenhum dado de ${tipo} disponível</p>`;
    return;
  }

  dados.forEach((registro) => {
    const div = document.createElement('div');
    div.classList.add('data-item');

    if (tipo === 'mapa') {
      div.innerHTML = `
        <div class="data-field"><strong>Lat:</strong> <span>${registro.latitude}</span></div>
        <div class="data-field"><strong>Long:</strong> <span>${registro.longitude}</span></div>
      `;
    } else {
      const unidade = tipo === 'temperatura' ? '°C' :
                      tipo === 'umidade' ? '%' :
                      tipo === 'vento' ? ' m/s' : '';
      div.innerHTML = `
        <div class="data-field"><strong>${tipo.charAt(0).toUpperCase() + tipo.slice(1)}:</strong> <span>${registro.valor}${unidade}</span></div>
      `;
    }

    container.appendChild(div);
  });
}

