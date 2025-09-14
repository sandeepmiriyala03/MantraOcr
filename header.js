
(() => {

  function createHeader() {
    const header = document.createElement("header");
    header.className = "header-fixed";
    header.setAttribute("role", "banner");

    const container = document.createElement("div");
    container.className = "container header-content";

    // Logo container
    const logoContainer = document.createElement("div");
    logoContainer.className = "logo-container";
    const logoImg = document.createElement("img");
    logoImg.src = "అక్షరధార.png";
    logoImg.alt = "Aksharadhara Logo";
    logoImg.className = "logo-img";
    logoContainer.appendChild(logoImg);
    container.appendChild(logoContainer);

    // Logo link
    const logoDiv = document.createElement("div");
    logoDiv.className = "logo";
    const logoLink = document.createElement("a");
    logoLink.href = "index.html";
    logoLink.setAttribute("aria-label", "అక్షరధార హోమ్");
    logoLink.textContent = "అక్షరధార";
    logoDiv.appendChild(logoLink);
    container.appendChild(logoDiv);

    // Navigation container
    const nav = document.createElement("nav");
    nav.id = "nav-links";
    nav.className = "nav-links";
    nav.setAttribute("aria-label", "ప్రధాన నావిగేషన్");

    // Menu items data
    const navItems = [
      { href: "sanskrit.html", iconClass: "nav-sansrkit", text: "संस्कृतम्", classes: "nav-link text-lg font-medium" },
      { href: "shuklayajurveda.html", iconClass: "nav-shuk", text: "శుక్లయజుర్వేదం", classes: "nav-link text-lg font-medium" },
      { href: "shruti-sankalanam.html", iconClass: "nav-krish", text: "కృష్ణయజుర్వేదం", classes: "nav-link text-lg font-medium" },
      { href: "telugu.html", iconClass: "nav-telugu", text: "తెలుగు", classes: "nav-link text-lg font-medium" },
      { href: "english.html", iconClass: "fas fa-language", text: "English", classes: "nav-link text-lg font-medium nav-english" }
    ];

    // Create navigation links
    navItems.forEach(({ href, iconClass, text, classes }) => {
      const a = document.createElement("a");
      a.href = href;
      a.className = classes || "";
      a.setAttribute("tabindex", "0");

      // Create icon if iconClass is non-empty
      if (iconClass) {
        const icon = document.createElement("i");
        icon.className = iconClass;
        a.appendChild(icon);
      }

      a.appendChild(document.createTextNode(" " + text));
      nav.appendChild(a);
    });

    // PWA Install Button (hidden by default)
    const pwaButton = document.createElement("button");
    pwaButton.id = "header-pwa-install";
    pwaButton.className = "nav-link pwa-install-btn";
    pwaButton.style.display = "none";
    pwaButton.setAttribute("aria-label", "యాప్ ఇన్‌స్టాల్ చేయండి");
    pwaButton.innerHTML = `
      <i class="fas fa-download"></i>
      <span class="pwa-text">ఇన్‌స్టాల్</span>
    `;

    pwaButton.addEventListener("click", () => {
      if (window.PWA?.deferredPrompt) {
        window.PWA.triggerInstall();
      }
    });

    nav.appendChild(pwaButton);
    container.appendChild(nav);

    // Hamburger button for mobile navigation toggle
    const hamburger = document.createElement("button");
    hamburger.id = "hamburger-icon";
    hamburger.className = "hamburger-icon";
    hamburger.setAttribute("aria-label", "మెను తెరవండి");
    hamburger.setAttribute("aria-controls", "nav-links");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-haspopup", "true");
    hamburger.type = "button";
    hamburger.innerHTML = `
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>`;
    container.appendChild(hamburger);

    header.appendChild(container);
    return header;
  }

  // Show or hide hamburger based on viewport width
  function updateHamburgerVisibility() {
    const hamburger = document.getElementById("hamburger-icon");
    const navLinks = document.getElementById("nav-links");
    if (!hamburger || !navLinks) return;

    if (window.innerWidth <= 768) {
      hamburger.style.display = "flex";
    } else {
      // Hide hamburger for desktop and ensure nav state reset
      hamburger.style.display = "none";
      navLinks.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }
  }

  // Show PWA install button
  function showHeaderPWAButton() {
    const pwaButton = document.getElementById("header-pwa-install");
    if (pwaButton) {
      pwaButton.style.display = "flex";
    }
  }

  // Hide PWA install button
  function hideHeaderPWAButton() {
    const pwaButton = document.getElementById("header-pwa-install");
    if (pwaButton) {
      pwaButton.style.display = "none";
    }
  }

  // Initialize header and event listeners on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    document.body.prepend(createHeader());

    const hamburger = document.getElementById("hamburger-icon");
    const navLinks = document.getElementById("nav-links");
    if (!hamburger || !navLinks) return;

    updateHamburgerVisibility();
    window.addEventListener("resize", updateHamburgerVisibility);

    // Toggle mobile menu open/close with keyboard support
    function toggleMenu() {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("active");
    }

    hamburger.addEventListener("click", toggleMenu);
    hamburger.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        toggleMenu();
      }
    });

    // Close menu when clicking on a nav link (on mobile)
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          navLinks.classList.remove("active");
          hamburger.setAttribute("aria-expanded", "false");
        }
      });
    });

    // Close menu clicking outside when open on mobile
    document.addEventListener("click", event => {
      if (
        window.innerWidth <= 768 &&
        !navLinks.contains(event.target) &&
        !hamburger.contains(event.target) &&
        navLinks.classList.contains("active")
      ) {
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });

    // PWA button visibility control
    window.addEventListener('beforeinstallprompt', showHeaderPWAButton);
    window.addEventListener('appinstalled', hideHeaderPWAButton);
  });

  // Export PWA button control functions
  window.HeaderPWA = {
    showInstallButton: showHeaderPWAButton,
    hideInstallButton: hideHeaderPWAButton
  };
})();
