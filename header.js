// Function to create header dynamically
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
    { href: "index.html", iconClass: "fas fa-home", text: "హోమ్", classes: "nav-link text-lg font-medium" },
    { href: "aksharadhara.html", iconClass: "fas fa-book-open", text: "అక్షరధార", classes: "nav-link text-lg font-medium" },
    { href: "ShuklaYajurveda.html", iconClass: "fas fa-scroll", text: "శుక్ల యజుర్వేదం", classes: "nav-link text-lg font-medium" },
    { href: "shruti-sankalanam.html", iconClass: "fas fa-pray", text: "కృష్ణ యజుర్వేదం", classes: "nav-link text-lg font-medium", role: "menuitem" },
    { href: "Telugu.html", iconClass: "fas fa-pen-nib", text: "తెలుగు", classes: "nav-link text-lg font-medium" },
    { href: "english.html", iconClass: "fas fa-language", text: "English", classes: "nav-link text-lg font-medium nav-english" }
  ];

  // Build menu links
  navItems.forEach(item => {
    const a = document.createElement("a");
    a.href = item.href;
    if (item.classes) a.className = item.classes;
    if (item.role) a.setAttribute("role", item.role);

    const icon = document.createElement("i");
    icon.className = item.iconClass;
    a.appendChild(icon);
    a.appendChild(document.createTextNode(" " + item.text));
    nav.appendChild(a);
  });

  // PWA Install Button
  const pwaButton = document.createElement("button");
  pwaButton.id = "header-pwa-install";
  pwaButton.className = "nav-link pwa-install-btn";
  pwaButton.style.display = "none"; // Hidden by default
  pwaButton.setAttribute("aria-label", "యాప్ ఇన్‌స్టాల్ చేయండి");
  pwaButton.innerHTML = `
    <i class="fas fa-download"></i>
    <span class="pwa-text">ఇన్‌స్టాల్</span>
  `;
  
  // PWA install click handler
  pwaButton.addEventListener("click", () => {
    if (window.PWA && window.PWA.deferredPrompt) {
      window.PWA.triggerInstall();
    }
  });

  nav.appendChild(pwaButton);
  container.appendChild(nav);

  // Hamburger button for mobile
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

// Control hamburger visibility and PWA button
function updateHamburgerVisibility() {
  const hamburger = document.getElementById("hamburger-icon");
  if (!hamburger) return;

  if (window.innerWidth <= 768) {
    hamburger.style.display = "flex";
  } else {
    hamburger.style.display = "none";
    const navLinks = document.getElementById("nav-links");
    if (navLinks) {
      navLinks.classList.remove("active");
    }
    hamburger.setAttribute("aria-expanded", "false");
  }
}

// PWA Integration Functions
function showHeaderPWAButton() {
  const pwaButton = document.getElementById("header-pwa-install");
  if (pwaButton) {
    pwaButton.style.display = "flex";
  }
}

function hideHeaderPWAButton() {
  const pwaButton = document.getElementById("header-pwa-install");
  if (pwaButton) {
    pwaButton.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.prepend(createHeader());

  const hamburger = document.getElementById("hamburger-icon");
  const navLinks = document.getElementById("nav-links");

  updateHamburgerVisibility();
  window.addEventListener("resize", updateHamburgerVisibility);

  if (hamburger && navLinks) {
    // Toggle mobile menu open/close
    hamburger.addEventListener("click", () => {
      const expanded = hamburger.getAttribute("aria-expanded") === "true";
      hamburger.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("active");
    });

    // Close menu when clicking on links (mobile)
    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          navLinks.classList.remove("active");
          hamburger.setAttribute("aria-expanded", "false");
        }
      });
    });

    // Close menu on clicking outside
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
  }

  // PWA Button Control
  window.addEventListener('beforeinstallprompt', () => {
    showHeaderPWAButton();
  });

  window.addEventListener('appinstalled', () => {
    hideHeaderPWAButton();
  });
});

// Export functions for PWA integration
window.HeaderPWA = {
  showInstallButton: showHeaderPWAButton,
  hideInstallButton: hideHeaderPWAButton
};
