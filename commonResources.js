(function injectCommonResources() {
  const head = document.head;

  // Meta tags
  const metas = [
    { charset: "UTF-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1.0" },
    { name: "theme-color", content: "#5a67d8" },
    { name: "apple-mobile-web-app-capable", content: "yes" },
    { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    { name: "apple-mobile-web-app-title", content: "అక్షరధార" },
  ];
  metas.forEach(attrs => {
    const meta = document.createElement("meta");
    if (attrs.charset) {
      meta.setAttribute("charset", attrs.charset);
    } else {
      Object.entries(attrs).forEach(([key, value]) => meta.setAttribute(key, value));
    }
    head.appendChild(meta);
  });

  // Link tags
  const links = [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
    { 
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;700&family=Roboto:wght@400;500;700&display=swap" 
    },
    { rel: "stylesheet", href: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" },
    { rel: "stylesheet", href: "styles.css" },
    { rel: "stylesheet", href: "book.css" },
    { rel: "manifest", href: "/manifest.json" },
    { rel: "apple-touch-icon", href: "అక్షరధార.png" },
  ];
  links.forEach(attrs => {
    const link = document.createElement("link");
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === "") link.setAttribute(key, "");
      else link[key] = value;
    });
    head.appendChild(link);
  });

  // Scripts (non-deferred scripts load immediately)
  const nonDeferredScripts = [
    "https://unpkg.com/tesseract.js@4.1.0/dist/tesseract.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.0/jszip.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js",
    "pwa.js"
  ];

  nonDeferredScripts.forEach(src => {
    const script = document.createElement("script");
    script.src = src;
    head.appendChild(script);
  });

  // Deferred scripts loaded sequentially to ensure order
  const deferredScripts = [
    "header.js",
    "footer.js"
  ];

  function loadDeferredScripts(scripts, index = 0) {
    if (index >= scripts.length) return;
    const script = document.createElement("script");
    script.src = scripts[index];
    script.defer = true;
    script.onload = () => loadDeferredScripts(scripts, index + 1);
    script.onerror = () => loadDeferredScripts(scripts, index + 1);
    head.appendChild(script);
  }

  loadDeferredScripts(deferredScripts);

  // Register service worker    