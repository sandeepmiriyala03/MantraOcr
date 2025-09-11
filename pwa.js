// pwa-simple.js - Simplified PWA for Pure HTML

class SimplePWA {
  constructor() {
    this.isFileProtocol = window.location.protocol === 'file:';
    this.init();
  }

  init() {
    if (this.isFileProtocol) {
      console.log('Running on file:// - PWA features limited');
      this.showFileProtocolMessage();
    } else {
      this.registerServiceWorker();
      this.setupInstallPrompt();
    }
  }

  showFileProtocolMessage() {
    // Show info message instead of errors
    const infoDiv = document.createElement('div');
    infoDiv.style.cssText = `
      position: fixed; top: 10px; right: 10px; 
      background: #e6f4ff; color: #1c7ed6; 
      padding: 0.5rem; border-radius: 8px; 
      font-size: 0.8rem; z-index: 1000;
      max-width: 200px; text-align: center;
    `;
    infoDiv.innerHTML = 'పూర్తి PWA అనుభవం కోసం HTTP సర్వర్ ఉపయోగించండి';
    document.body.appendChild(infoDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      infoDiv.remove();
    }, 5000);
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW failed:', error);
        });
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.showInstallOption();
    });
  }

  showInstallOption() {
    if (window.HeaderPWA) {
      window.HeaderPWA.showInstallButton();
    }
  }

  // Fallback install method
  installApp() {
    if (this.isFileProtocol) {
      alert('దయచేసి HTTP సర్వర్ ద్వారా సైట్‌ను యాక్సెస్ చేయండి PWA ఇన్‌స్టాల్ చేయడానికి');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.PWA = new SimplePWA();
});
