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

  // Compose the paragraph content with symbols and spans
  p.append("© అక్షరధార - సందీప్ మిరియాల ");

  // Create span for dynamic last deploy time
  const deployTimeSpan = document.createElement("span");
  deployTimeSpan.id = "deploy-time";
  deployTimeSpan.textContent = "loading..."; // Placeholder text

  p.appendChild(deployTimeSpan);
  footer.appendChild(p);
  footerContainer.appendChild(footer);

  return footerContainer;
}

// Append the footer to the body or a specific container
document.body.appendChild(createFooter());


