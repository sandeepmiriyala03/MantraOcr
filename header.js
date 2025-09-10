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
    { href: "ShuklaYajurveda.html", iconClass: "fas fa-scroll", text: "శుక్ల ", classes: "nav-link text-lg font-medium" },
    { href: "shruti-sankalanam", iconClass: "fas fa-pray", text: "కృష్ణ", classes: "nav-link text-lg font-medium", role: "menuitem" },
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
    <svg class="w-8 h-8 text-[#1f3674]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
     xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>`;
  container.appendChild(hamburger);

  header.appendChild(container);

  return header;
}

// Append header and add responsive menu behavior
document.addEventListener("DOMContentLoaded", () => {
  document.body.prepend(createHeader());

  const hamburger = document.getElementById("hamburger-icon");
  const navLinks = document.getElementById("nav-links");

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
});
