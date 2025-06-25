// Configuração centralizada dos projetos

const projectConfig = {
  // Projeto 1: Cadastro de Animais
  '1': {
    id: '1',
    name: 'Cadastro de Animais',
    description: 'Sistema de gerenciamento e cadastro de animais com monitoramento IoT',
    route: '/projeto1',
    icon: '/img/icons/animals.svg',
    color: '#4CAF50',
    technologies: ['IoT', 'MQTT', 'MongoDB'],
    features: [
      'Cadastro de animais',
      'Monitoramento em tempo real',
      'Histórico de dados',
      'Alertas automáticos'
    ],
    status: 'active'
  },
  
  // Projeto 2: Monitoramento Climático
  '2': {
    id: '2',
    name: 'Monitoramento Climático',
    description: 'Sistema de monitoramento ambiental com dados climáticos e geolocalização',
    route: '/projeto2',
    icon: '/img/icons/dashboard.svg',
    color: '#2196F3',
    technologies: ['MQTT', 'Maps', 'Weather API'],
    features: [
      'Monitoramento climático',
      'Visualização em mapa',
      'Gráficos em tempo real',
      'Dados de sensores'
    ],
    status: 'active'
  },
  
  // Projeto 3: Envio de Arquivos
  '3': {
    id: '3',
    name: 'Envio de Arquivos',
    description: 'Sistema de upload e gerenciamento de arquivos para dispositivos IoT',
    route: '/send-files',
    icon: '/img/icons/files.svg',
    color: '#FF9800',
    technologies: ['File Upload', 'Storage', 'Processing'],
    features: [
      'Upload de múltiplos arquivos',
      'Processamento automático',
      'Backup em nuvem',
      'Histórico de uploads'
    ],
    status: 'active'
  },
  
  // Projeto 4: Dashboard de Sensores (exemplo futuro)
  '4': {
    id: '4',
    name: 'Dashboard de Sensores',
    description: 'Visualização de dados de sensores em tempo real',
    route: '/dashboard',
    icon: '/img/icons/dashboard.svg',
    color: '#9C27B0',
    technologies: ['WebSockets', 'Chart.js', 'Real-time'],
    features: [
      'Gráficos em tempo real',
      'Múltiplos sensores',
      'Alertas configuráveis',
      'Exportação de dados'
    ],
    status: 'development' // em desenvolvimento
  },
  
  // Projeto 5: Controle de Dispositivos (exemplo futuro)
  '5': {
    id: '5',
    name: 'Controle de Dispositivos',
    description: 'Interface para controle remoto de dispositivos IoT',
    route: '/control',
    icon: '/img/icons/control.svg',
    color: '#4CAF50',
    technologies: ['MQTT', 'Remote Control', 'Automation'],
    features: [
      'Controle remoto',
      'Automação programada',
      'Grupos de dispositivos',
      'Histórico de comandos'
    ],
    status: 'planned' // planejado
  }
};

// Função helper para obter projetos ativos
function getActiveProjects() {
  return Object.values(projectConfig).filter(project => project.status === 'active');
}

// Função helper para obter projeto por ID
function getProjectById(id) {
  return projectConfig[id] || null;
}

// Função helper para obter todos os projetos
function getAllProjects() {
  return Object.values(projectConfig);
}

// Função helper para obter projetos por status
function getProjectsByStatus(status) {
  return Object.values(projectConfig).filter(project => project.status === status);
}

// Função para redirecionar baseado no projeto do usuário
function getProjectRedirectUrl(projectId) {
  const project = getProjectById(projectId);
  return project ? project.route : '/projeto1'; // fallback para projeto 1
}

module.exports = {
  projectConfig,
  getActiveProjects,
  getProjectById,
  getAllProjects,
  getProjectsByStatus,
  getProjectRedirectUrl
};
