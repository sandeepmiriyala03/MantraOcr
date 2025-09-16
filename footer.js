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
  p.append("© అక్షరధార - సందీప్ మిరియాల - 🕒 చివరి: ");

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

// Example: set deployment time dynamically (can come from your code or static value)
const options = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZoneName: "short",
};
document.getElementById("deploy-time").textContent = new Date().toLocaleString("te-IN", options);
