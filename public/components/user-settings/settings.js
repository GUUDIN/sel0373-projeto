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
    if (!projectSelect) return;

    // Detectar projeto atual pela URL
    const currentPath = window.location.pathname;
    let currentProject = null;
    
    if (currentPath.includes('/projeto1')) {
      currentProject = 1;
    } else if (currentPath.includes('/projeto2')) {
      currentProject = 2;
    }

    if (currentProject) {
      // Usar selectedIndex
      const targetOption = projectSelect.querySelector(`option[value="${currentProject}"]`);
      if (targetOption) {
        const targetIndex = Array.from(projectSelect.options).indexOf(targetOption);
        projectSelect.selectedIndex = targetIndex;
      }

      // Usar .value (backup)
      projectSelect.value = currentProject.toString();
      
      // Forçar evento change
      projectSelect.dispatchEvent(new Event('change'));
    }
  }

  function closeSettingsCard() {
    if (settingsOverlay) {
      settingsOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  // Interceptar o submit do formulário
  if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
      // Form submete normalmente para o servidor
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