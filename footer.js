function createFooter() {
  // Create container div
  const footerContainer = document.createElement("div");
  footerContainer.className = "footer-container";

  // Create footer element
  const footer = document.createElement("footer");
  footer.className = "footer-fixed";
  footer.setAttribute("role", "contentinfo");

  // Create paragraph element
  const p = document.createElement("p");
  p.className = "text-sm md:text-base";

  // Create copyright span with current year
  const copyright = document.createElement("span");
  copyright.id = "currentYear";
  copyright.textContent = new Date().getFullYear();

  // Create current date-time span
  const currentDateTime = document.createElement("span");
  currentDateTime.id = "currentDateTime";
  currentDateTime.textContent = new Date().toLocaleString("te-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Compose the paragraph content with text and spans
  p.append("© ");
  p.appendChild(copyright);
  p.append(" అక్షరధార | సర్వ హక్కులు రిజర్వ్ చేయబడ్డాయి. | ");
  p.appendChild(currentDateTime);

  footer.appendChild(p);
  footerContainer.appendChild(footer);

  return footerContainer;
}

// Append the footer to the body or a specific container
document.body.appendChild(createFooter());
