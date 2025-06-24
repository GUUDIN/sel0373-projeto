document.addEventListener("DOMContentLoaded", () => {
  const settingsOverlay = document.getElementById("settingsOverlay");
  const settingsCard = document.getElementById("settingsCard");
  const profileButton = document.querySelector(".profile-button");
  const closeButton = document.getElementById("closeSettings");

  function openSettingsCard() {
    settingsOverlay?.classList.add("active");
    document.body.style.overflow = "hidden"; // prevent scroll behind
  }

  function closeSettingsCard() {
    settingsOverlay?.classList.remove("active");
    document.body.style.overflow = ""; // restore scroll
  }

  if (profileButton) {
    profileButton.addEventListener("click", (e) => {
      e.preventDefault();
      openSettingsCard();
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeSettingsCard);
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