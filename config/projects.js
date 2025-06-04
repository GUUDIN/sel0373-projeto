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
  
  // Projeto 2: Envio de Arquivos
  '2': {
    id: '2',
    name: 'Envio de Arquivos',
    description: 'Sistema de upload e gerenciamento de arquivos para dispositivos IoT',
    route: '/send-files',
    icon: '/img/icons/files.svg',
    color: '#2196F3',
    technologies: ['File Upload', 'Storage', 'Processing'],
    features: [
      'Upload de múltiplos arquivos',
      'Processamento automático',
      'Backup em nuvem',
      'Histórico de uploads'
    ],
    status: 'active'
  },
  
  // Projeto 3: Dashboard de Sensores (exemplo futuro)
  '3': {
    id: '3',
    name: 'Dashboard de Sensores',
    description: 'Visualização de dados de sensores em tempo real',
    route: '/dashboard',
    icon: '/img/icons/dashboard.svg',
    color: '#FF9800',
    technologies: ['WebSockets', 'Chart.js', 'Real-time'],
    features: [
      'Gráficos em tempo real',
      'Múltiplos sensores',
      'Alertas configuráveis',
      'Exportação de dados'
    ],
    status: 'development' // em desenvolvimento
  },
  
  // Projeto 4: Controle de Dispositivos (exemplo futuro)
  '4': {
    id: '4',
    name: 'Controle de Dispositivos',
    description: 'Interface para controle remoto de dispositivos IoT',
    route: '/control',
    icon: '/img/icons/control.svg',
    color: '#9C27B0',
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
  return project ? project.route : '/send-files'; // fallback para projeto 2
}

module.exports = {
  projectConfig,
  getActiveProjects,
  getProjectById,
  getAllProjects,
  getProjectsByStatus,
  getProjectRedirectUrl
};
