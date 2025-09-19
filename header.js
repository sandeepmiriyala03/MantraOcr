(() => {
  // Caching DOM elements for efficiency
  const SELECTORS = {
    headerPWAInstall: '#header-pwa-install',
    headerPWAUpdate: '#header-pwa-update',
    hamburgerIcon: '#hamburger-icon',
    navLinks: '#nav-links',
    container: '.header-content',
    body: 'body',
    logoContainer: '.logo-container',
    logo: '.logo',
    logoImg: 'అక్షరధార.png',
    navLink: '.nav-link',
    headerFixed: '.header-fixed'
  };


  /**
   * Creates and returns the header element with all its child elements.
   * This function is a pure builder, not a manipulator.
   * @returns {HTMLElement} The created header element.
   */
  function createHeader() {
    const header = document.createElement("header");
    header.className = "header-fixed";
    header.setAttribute("role", "banner");

    const container = document.createElement("div");
    container.className = "container header-content";

    // Build the logo section
    const logoContainer = document.createElement("div");
    logoContainer.className = "logo-container";
    const logoImg = document.createElement("img");
    logoImg.src = SELECTORS.logoImg;
    logoImg.alt = "Aksharadhara Logo";
    logoImg.className = "logo-img";
    logoContainer.appendChild(logoImg);

    const logoDiv = document.createElement("div");
    logoDiv.className = "logo";
    const logoLink = document.createElement("a");
    logoLink.href = "index.html";
    logoLink.setAttribute("aria-label", "అక్షరధార హోమ్");
    logoLink.textContent = "అక్షరధార";
    logoDiv.appendChild(logoLink);
    container.appendChild(logoContainer);
    container.appendChild(logoDiv);

    // Build the navigation links
    const nav = document.createElement("nav");
    nav.id = SELECTORS.navLinks.slice(1);
    nav.className = "nav-links";
    nav.setAttribute("aria-label", "ప్రధాన నావిగేషన్");

    const navItems = [
      { href: "sanskrit.html", iconClass: "nav-sansrkit", text: "संस्कृतम्" },
      { href: "shuklayajurveda.html", iconClass: "nav-shuk", text: "శుక్లయజుర్వేదం" },
      { href: "shruti-sankalanam.html", iconClass: "nav-krish", text: "కృష్ణయజుర్వేదం" },
      { href: "telugu.html", iconClass: "nav-telugu", text: "తెలుగు" },
      { href: "english.html", iconClass: "fas fa-language", text: "English", additionalClasses: "nav-english" }
    ];

    navItems.forEach(({ href, iconClass, text, additionalClasses = '' }) => {
      const a = document.createElement("a");
      a.href = href;
      a.className = `nav-link text-lg font-medium ${additionalClasses}`.trim();
      a.setAttribute("tabindex", "0");

      if (iconClass) {
        const icon = document.createElement("i");
        icon.className = iconClass;
        a.appendChild(icon);
      }

      a.appendChild(document.createTextNode(" " + text));
      nav.appendChild(a);
    });

    // PWA Buttons (Install & Update)
    const createPWAButton = (id, iconClass, text, ariaLabel) => {
      const button = document.createElement("button");
      button.id = id.slice(1);
      button.className = `nav-link pwa-btn ${id.slice(1)}`;
      button.style.display = "none";
      button.setAttribute("aria-label", ariaLabel);
      button.innerHTML = `<i class="${iconClass}"></i><span class="pwa-text">${text}</span>`;
      return button;
    };

    const pwaInstallBtn = createPWAButton(
      SELECTORS.headerPWAInstall,
      "fas fa-download",
      "ఇన్‌స్టాల్",
      "యాప్ ఇన్‌స్టాల్ చేయండి"
    );
    pwaInstallBtn.addEventListener("click", () => window.PWA?.triggerInstall());

    const pwaUpdateBtn = createPWAButton(
      SELECTORS.headerPWAUpdate,
      "fas fa-sync-alt",
      "నవీకరణ",
      "యాప్ నవీకరణ అందుబాటులో ఉంది, రీలోడ్ చేయండి"
    );
    pwaUpdateBtn.addEventListener("click", () => {
      if (window.deferredSWWaiting) {
        window.deferredSWWaiting.postMessage({ type: 'SKIP_WAITING' });
        pwaUpdateBtn.style.display = "none";
      }
    });

    nav.appendChild(pwaInstallBtn);
    nav.appendChild(pwaUpdateBtn);
    container.appendChild(nav);

    // Hamburger button
    const hamburger = document.createElement("button");
    hamburger.id = SELECTORS.hamburgerIcon.slice(1);
    hamburger.className = "hamburger-icon";
    hamburger.setAttribute("aria-label", "మెను తెరవండి");
    hamburger.setAttribute("aria-controls", SELECTORS.navLinks.slice(1));
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-haspopup", "true");
    hamburger.type = "button";
    hamburger.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>`;
    container.appendChild(hamburger);

    header.appendChild(container);
    return header;
  }

  /**
   * Handles the state of the hamburger menu and its event listeners.
   */
  function setupHamburgerMenu() {
    const hamburger = document.querySelector(SELECTORS.hamburgerIcon);
    const navLinks = document.querySelector(SELECTORS.navLinks);

    if (!hamburger || !navLinks) {
      console.error("Hamburger or navigation links not found.");
      return;
    }

    const toggleMenu = () => {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("active");
    };

    // Toggle menu visibility
    hamburger.addEventListener("click", toggleMenu);
    hamburger.addEventListener("keydown", (e) => {
      if (["Enter", " "].includes(e.key)) {
        e.preventDefault();
        toggleMenu();
      }
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          navLinks.classList.remove("active");
          hamburger.setAttribute("aria-expanded", "false");
        }
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (event) => {
      if (
        window.innerWidth <= 768 &&
        !navLinks.contains(event.target) &&
        !hamburger.contains(event.target) &&
        navLinks.classList.contains("active")
      ) {
        toggleMenu();
      }
    });

    // Handle initial and resize state
    const updateVisibility = () => {
      if (window.innerWidth <= 768) {
        hamburger.style.display = "flex";
      } else {
        hamburger.style.display = "none";
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      }
    };

    updateVisibility();
    window.addEventListener("resize", updateVisibility);
  }

  /**
   * Manages PWA-related button visibility and event listeners.
   */
  function setupPwaButtons() {
    const installBtn = document.querySelector(SELECTORS.headerPWAInstall);
    const updateBtn = document.querySelector(SELECTORS.headerPWAUpdate);

    if (!installBtn || !updateBtn) {
      console.error("PWA buttons not found.");
      return;
    }

    const showInstallButton = () => { installBtn.style.display = "flex"; };
    const hideInstallButton = () => { installBtn.style.display = "none"; };
    const showUpdateButton = () => { updateBtn.style.display = "flex"; };

    window.addEventListener('beforeinstallprompt', showInstallButton);
    window.addEventListener('appinstalled', hideInstallButton);

    // Service worker update logic
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          if (registration.waiting) {
            window.deferredSWWaiting = registration.waiting;
            showUpdateButton();
          }

          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  window.deferredSWWaiting = newWorker;
                  showUpdateButton();
                }
              });
            }
          });
        });

      // Reload page after service worker update
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      });
    }
  }

  // Entry point: Wait for the DOM to be fully loaded
  document.addEventListener("DOMContentLoaded", () => {
    document.body.prepend(createHeader());
    setupHamburgerMenu();
    setupPwaButtons();
  });
})();