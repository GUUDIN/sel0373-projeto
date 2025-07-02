document.addEventListener("DOMContentLoaded", () => {
  const settingsOverlay = document.getElementById("settingsOverlay");
  const settingsCard = document.getElementById("settingsCard");
  const profileButton = document.querySelector(".profile-button");
  const closeButton = document.getElementById("closeSettings");
  const settingsForm = document.querySelector('#settingsCard form[action="/users/settings"]');

  function openSettingsCard() {
    if (settingsOverlay) {
      settingsOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
      
      // Corrigir DEPOIS que o card estiver visível
      setTimeout(() => {
        updateProjectSelectBasedOnURL();
      }, 100);
    }
  }

  function updateProjectSelectBasedOnURL() {
    const projectSelect = document.querySelector('.project-select');
    if (!projectSelect) {
      console.log('❌ Project select não encontrado');
      return;
    }

    // Detectar projeto atual pela URL
    const currentPath = window.location.pathname;
    console.log('🔍 URL atual:', currentPath);
    
    let currentProject = null;
    
    if (currentPath.includes('/projeto1')) {
      currentProject = 1;
    } else if (currentPath.includes('/projeto2')) {
      currentProject = 2;
    }

    console.log('🎯 Projeto detectado:', currentProject);

    if (currentProject) {
      // MÉTODO 1: Usar selectedIndex
      const targetOption = projectSelect.querySelector(`option[value="${currentProject}"]`);
      if (targetOption) {
        const targetIndex = Array.from(projectSelect.options).indexOf(targetOption);
        projectSelect.selectedIndex = targetIndex;
        console.log('✅ selectedIndex definido para:', targetIndex);
      }

      // MÉTODO 2: Usar .value (backup)
      projectSelect.value = currentProject.toString();
      console.log('✅ value definido para:', projectSelect.value);

      // MÉTODO 3: Forçar evento change
      projectSelect.dispatchEvent(new Event('change'));

      // Verificar resultado final
      console.log('🔍 Valor final do select:', projectSelect.value);
      console.log('🔍 Índice selecionado:', projectSelect.selectedIndex);
    } else {
      console.log('⚠️ Nenhum projeto detectado na URL');
    }
  }

  function closeSettingsCard() {
    if (settingsOverlay) {
      settingsOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  // Interceptar o submit do formulário para debugging
  if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
      const formData = new FormData(this);
      const selectedProject = formData.get('project');
      console.log('📤 Enviando projeto:', selectedProject);
    });
  }

  if (profileButton) {
    profileButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSettingsCard();
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSettingsCard();
    });
  }

  // Close when clicking outside the card
  if (settingsOverlay) {
    settingsOverlay.addEventListener("click", (e) => {
      if (e.target === settingsOverlay) {
        closeSettingsCard();
      }
    });
  }

  // Close on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSettingsCard();
    }
  });
});