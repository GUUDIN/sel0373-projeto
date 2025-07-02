// Smooth scroll functionality for index page
document.addEventListener('DOMContentLoaded', function() {
  const scrollIndicator = document.querySelector('.scroll-indicator');
  const projectsSection = document.querySelector('.projects-section');
  
  if (scrollIndicator && projectsSection) {
    scrollIndicator.addEventListener('click', function() {
      projectsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  }
  
  // Optional: Hide scroll indicator when projects section is visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (scrollIndicator) {
          scrollIndicator.style.opacity = '0';
          scrollIndicator.style.pointerEvents = 'none';
        }
      } else {
        if (scrollIndicator) {
          scrollIndicator.style.opacity = '1';
          scrollIndicator.style.pointerEvents = 'auto';
        }
      }
    });
  }, {
    threshold: 0.1
  });
  
  
  if (projectsSection) {
    observer.observe(projectsSection);
  }
});
