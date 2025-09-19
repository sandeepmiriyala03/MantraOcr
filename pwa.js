// pwa.js - Complete PWA solution for pure HTML project

class PWAManager {
  constructor() {
    this.deferredPrompt = null;
    this.isFileProtocol = window.location.protocol === 'file:';
    this.init();
  }

  init() {
    if (this.isFileProtocol) {
      console.warn('Running on file:// - Limited PWA features');
      this.setupMobileFeatures();
    } else {
      console.log('Running on HTTP/HTTPS - Full PWA features available');
      this.registerServiceWorker();
      this.setupInstallPrompt();
    }
    this.detectMobile();
  }

  detectMobile() {
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.isAndroid = /Android/.test(navigator.userAgent);
    this.isMobile = this.isIOS || this.isAndroid;
  }

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      
      // Show header PWA button
      if (window.HeaderPWA) {
        window.HeaderPWA.showInstallButton();
      } else {
        this.showInstallButton();
      }
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      if (window.HeaderPWA) {
        window.HeaderPWA.hideInstallButton();
      }
      this.hideInstallButton();
    });
  }

  setupMobileFeatures() {
    // For file:// protocol, show mobile-friendly install option
    if (this.isMobile && !this.isInstalled()) {
      setTimeout(() => {
        this.showMobileInstallButton();
      }, 3000); // Show after 3 seconds
    }
  }

  showInstallButton() {
    if (document.getElementById('pwa-install-btn')) return;

    const installBtn = document.createElement('button');
    installBtn.id = 'pwa-install-btn';
    installBtn.textContent = 'ఇన్‌స్టాల్ చేయండి';
    installBtn.className = 'button pwa-install-button';
    
    installBtn.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 1000;
      font-size: 0.9rem; padding: 0.75rem 1rem; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    installBtn.addEventListener('click', () => {
      this.installPWA();
    });

    document.body.appendChild(installBtn);
  }

  showMobileInstallButton() {
    if (document.getElementById('mobile-install-btn')) return;

    const installBtn = document.createElement('button');
    installBtn.id = 'mobile-install-btn';
    installBtn.textContent = 'హోమ్ స్క్రీన్‌కు జోడించండి';
    installBtn.className = 'button mobile-install-btn';
    
    installBtn.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; z-index: 1000;
      background: #48bb78; color: white; border: none;
      font-size: 0.8rem; padding: 0.6rem 1rem; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;

    installBtn.addEventListener('click', () => {
      this.showMobileInstructions();
    });

    document.body.appendChild(installBtn);
  }

  showMobileInstructions() {
    let message;
    
    if (this.isIOS) {
      message = 'Safari మెను (Share ⎋) → "Add to Home Screen" ఎంచుకోండి';
    } else if (this.isAndroid) {
      message = 'Chrome మెను (⋮) → "Add to Home screen" ఎంచుకోండి';
    } else {
      message = 'బ్రౌజర్ మెను → "Add to Home screen" ఎంచుకోండి';
    }

    alert(message);
    
    // Hide the button after showing instructions
    const btn = document.getElementById('mobile-install-btn');
    if (btn) btn.remove();
  }

  hideInstallButton() {
    const btns = ['pwa-install-btn', 'mobile-install-btn'];
    btns.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.remove();
    });
  }

  installPWA() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        this.deferredPrompt = null;
        
        if (window.HeaderPWA) {
          window.HeaderPWA.hideInstallButton();
        }
        this.hideInstallButton();
      });
    } else if (this.isFileProtocol) {
      alert('పూర్తి PWA అనుభవం కోసం HTTP సర్వర్ ద్వారా సైట్‌ను యాక్సెస్ చేయండి');
    } else {
      alert('ఇన్‌స్టాల్ ప్రాంప్ట్ అందుబాటులో లేదు');
    }
  }

  triggerInstall() {
    this.installPWA();
  }

  isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.PWA = new PWAManager();
});
