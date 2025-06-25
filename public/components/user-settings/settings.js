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



  if (profileButton) {
    profileButton.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSettingsCard();
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