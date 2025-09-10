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

  // Nav links
  const nav = document.createElement("nav");
  nav.id = "nav-links";
  nav.className = "nav-links";
  nav.setAttribute("aria-label", "ప్రధాన నావిగేషన్");

  const navItems = [
    { href: "index.html", iconClass: "fas fa-home", text: "హోమ్", classes: "nav-link text-lg font-medium" },
    { href: "aksharadhara.html", iconClass: "fas fa-book-open", text: "అక్షరధార", classes: "nav-link text-lg font-medium" },
    { href: "ShuklaYajurveda.html", iconClass: "fas fa-scroll", text: "శుక్ల యజుర్వేదం", classes: "nav-link text-lg font-medium" },
    { href: "shruti-sankalanam.html", iconClass: "fas fa-pray", text: "కృష్ణ యజుర్వేదం", classes: null, role: "menuitem" },
    { href: "Telugu.html", iconClass: "fas fa-pen-nib", text: "తెలుగు కవిత్వం", classes: "nav-link text-lg font-medium" },
    { href: "english.html", iconClass: "fas fa-language nav-icon-feather-english", text: "English", classes: "nav-link text-lg font-medium nav-english" }
  ];

  navItems.forEach(item => {
    const a = document.createElement("a");
    a.href = item.href;
    if (item.classes) a.className = item.classes;
    if (item.role) a.setAttribute("role", item.role);

    const i = document.createElement("i");
    i.className = item.iconClass;
    a.appendChild(i);
    a.appendChild(document.createTextNode(" " + item.text));
    nav.appendChild(a);
  });

  container.appendChild(nav);

  // Hamburger menu
  const btn = document.createElement("button");
  btn.id = "hamburger-icon";
  btn.className = "hamburger-icon";
  btn.setAttribute("aria-label", "మెనూ తెరవండి");
  btn.setAttribute("aria-controls", "nav-links");
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-haspopup", "true");
  btn.type = "button";
  btn.innerHTML = `
    <svg class="w-8 h-8 text-[#1f3674]" fill="none" stroke="currentColor" viewBox="0 0 24 24"
         xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
    </svg>`;
  container.appendChild(btn);

  header.appendChild(container);

  return header;
}

// Wait for DOM content loaded then append header and bind events
document.addEventListener("DOMContentLoaded", () => {
  document.body.prepend(createHeader());

  const hamburger = document.getElementById("hamburger-icon");
  const navLinks = document.getElementById("nav-links");

  hamburger.addEventListener("click", () => {
    const expanded = hamburger.getAttribute("aria-expanded") === "true";
    hamburger.setAttribute("aria-expanded", !expanded);
    navLinks.classList.toggle("active");
  });

  // Close menu when clicking outside menu or hamburger and menu is open
  document.addEventListener("click", (e) => {
    if (
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target) &&
      navLinks.classList.contains("active")
    ) {
      navLinks.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });

  // Close menu when clicking any nav link on small screens
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      }
    });
  });
});
