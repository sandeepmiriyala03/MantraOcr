function injectCommonResources() {
  const head = document.head;

  // Add link elements
  const links = [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;700&family=Roboto:wght@400;500;700&display=swap" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;700&family=Inter:wght@400;500;700&display=swap" },
    { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" },
    { rel: "stylesheet", href: "styles.css" },
    { rel: "stylesheet", href: "book.css" },
  ];

  links.forEach(attrs => {
    const link = document.createElement("link");
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === "") link.setAttribute(key, "");
      else link[key] = value;
    });
    head.appendChild(link);
  });

  // Add script elements (defer those with defer attribute)
  const scripts = [
    { src: "https://unpkg.com/tesseract.js@4.1.0/dist/tesseract.min.js", defer: false },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.0/jszip.min.js", defer: false },
    { src: "https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js", defer: false },
    { src: "Vedhas.js", defer: true },
    { src: "header.js", defer: true },
    { src: "footer.js", defer: true },
  ];

  scripts.forEach(attrs => {
    const script = document.createElement("script");
    script.src = attrs.src;
    if (attrs.defer) script.defer = true;
    head.appendChild(script);
  });

  // Add Tailwind CSS CDN script which must be inside body or head
  const tailwindScript = document.createElement("script");
  tailwindScript.src = "https://cdn.tailwindcss.com";
  tailwindScript.defer = false;
  head.appendChild(tailwindScript);
}


