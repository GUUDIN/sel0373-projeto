document.addEventListener("DOMContentLoaded", () => {
  const settingsOverlay = document.getElementById("settingsOverlay");
  const settingsCard = document.getElementById("settingsCard");
  const profileButton = document.querySelector(".profile-button");
  const closeButton = document.getElementById("closeSettings");

  function openSettingsCard() {
    if (settingsOverlay) {
      settingsOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeSettingsCard() {
    if (settingsOverlay) {
      settingsOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
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