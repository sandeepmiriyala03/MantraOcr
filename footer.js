// Define welcomeShown outside createFooter to persist per page load
let welcomeShown = false;

function createFooter() {
  const footerContainer = document.createElement("div");
  footerContainer.className = "footer-container";

  const footer = document.createElement("footer");
  footer.className = "footer-fixed";
  footer.setAttribute("role", "contentinfo");

  const p = document.createElement("p");
  p.className = "text-sm md:text-base";
  p.append("©  సందీప్ మిరియాల ");

  // Chat toggle button with icon (optional reuse from before)
  const chatToggleBtn = document.createElement("button");
  chatToggleBtn.className = "chat-toggle-btn";
  chatToggleBtn.setAttribute("aria-expanded", "false");
  chatToggleBtn.textContent = "Chatbot";

  // Chat window container, initially hidden
  const chatWindow = document.createElement("div");
  chatWindow.className = "chat-window hidden";

  // Message display area
  const messages = document.createElement("div");
  messages.className = "chat-messages";

  // Input container
  const inputContainer = document.createElement("div");
  inputContainer.className = "chat-input-container";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Type your message (English, Telugu, Sanskrit)...";
  input.className = "chat-input";
  input.setAttribute("aria-label", "Type your message");

  const sendBtn = document.createElement("button");
  sendBtn.textContent = "Send";
  sendBtn.className = "chat-send-btn";

  inputContainer.appendChild(input);
  inputContainer.appendChild(sendBtn);

  chatWindow.appendChild(messages);
  chatWindow.appendChild(inputContainer);

  footer.appendChild(p);
  footer.appendChild(chatToggleBtn);
  footer.appendChild(chatWindow);
  footerContainer.appendChild(footer);

  // Pretrained multilingual responses with synonyms arrays for better matching
  const preTrainedResponses = {
    english: {
      greetings: ["hello", "hi", "hey", "namaste"],
      help: ["help", "support", "assist", "how to use", "usage"],
      responses: {
        greetings: "Hello! How can I assist you today?",
        help: `How to use Shruti Sankalanam:
1. Create a Book & Section - Name your scripture and create section.
2. Upload Image & Extract Text - Upload you mantra image, press 'Start OCR'.
3. Save Text - Provide name & description, then save mantra.
4. View & Download - View anytime; download book as HTML.`,
      },
    },
    telugu: {
      greetings: ["నమస్కారం", "హలో", "హాయ్"],
      help: ["సహాయం", "ఉపాయం", "వినియోగం", "ఎలా"],
      responses: {
        greetings: "నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?",
        help: `శ్రుతి సంకలనం ఎలా ఉపయోగించాలి:
1. పుస్తకం & భాగం సృష్టించండి.
2. చిత్రం అప్‌లోడ్ చేసి OCR ప్రారంభించండి.
3. పాఠ్యాన్ని సేవ్ చేయండి.
4. చూసి, డౌన్‌లోడ్ చేయండి.`,
      },
    },
    sanskrit: {
      greetings: ["नमस्ते", "हरि", "स्वागतम्"],
      help: ["सहाय", "प्रयोग", "कथं"],
      responses: {
        greetings: "नमस्ते! कथं सहायं करोतु?",
        help: `श्रुति-सङ्कलनं उपयोगः:
1. पुस्तकं च अङ्गं सृजत।
2. चित्रं अपलोड् कृत्वा OCR आरम्भयतु।
3. पाठ्यं सहेजतु।
4. पश्यतु च डाउनलोड् कुरुत।`,
      },
    },
  };

  // Detect simple language from text (same)
  function detectLanguage(text) {
    const teluguRegex = /[\u0C00-\u0C7F]/;
    const sanskritRegex = /[\u0900-\u097F]/;
    const latinRegex = /^[\u0000-\u007F\s.,!?'-]+$/;

    if (teluguRegex.test(text)) return "telugu";
    else if (sanskritRegex.test(text)) return "sanskrit";
    else if (latinRegex.test(text)) return "english";
    else return null;
  }

  // Add a message with small delay mimic typing
  function addMessage(text, fromUser = true) {
    const msg = document.createElement("div");
    msg.className = fromUser ? "message user-message" : "message bot-message";
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;

    // LIFO limit
    while (messages.children.length > 20) {
      messages.removeChild(messages.firstChild);
    }
  }

  // Basic fuzzy keyword matching helper
  function includesAny(str, keywords) {
    str = str.toLowerCase();
    return keywords.some(kw => str.includes(kw));
  }

  chatToggleBtn.addEventListener("click", () => {
    const expanded = chatToggleBtn.getAttribute("aria-expanded") === "true";
    chatToggleBtn.setAttribute("aria-expanded", !expanded);
    chatWindow.classList.toggle("hidden");

    if (!expanded) {
      if (!welcomeShown) {
        addMessage(
          `Welcome to AksharaDhara Chatbot!\n\nYou can ask how to use the Shruti Sankalanam OCR app in English, Telugu, or Sanskrit.\nTry typing greetings like "hello", "నమస్కారం", or "नमस्ते".`,
          false
        );
        welcomeShown = true;
      }
    } else {
      // On close: do NOT clear messages automatically to preserve context
      // messages.innerHTML = ""; // Optional: clear on close if business needs
    }
  });

  // Send message handler
  sendBtn.addEventListener("click", () => {
    const userMsg = input.value.trim();
    if (!userMsg) return;

    if (userMsg.toLowerCase() === "clear") {
      messages.innerHTML = "";
      input.value = "";
      addMessage("Chat cleared.", false);
      return;
    }

    const lang = detectLanguage(userMsg);
    if (!lang) {
      alert("Please enter text only in English, Telugu, or Sanskrit.");
      return;
    }

    addMessage(userMsg, true);
    input.value = "";

    // Delay bot response slightly (simulate typing)
    setTimeout(() => {
      const lowerMsg = userMsg.toLowerCase();

      if (includesAny(lowerMsg, preTrainedResponses[lang].greetings)) {
        addMessage(preTrainedResponses[lang].responses.greetings, false);
        return;
      }

      if (includesAny(lowerMsg, preTrainedResponses[lang].help)) {
        addMessage(preTrainedResponses[lang].responses.help, false);
        return;
      }

      addMessage(
        lang === "english"
          ? "Sorry, I don't have an answer for that yet."
          : lang === "telugu"
          ? "క్షమించండి, నాకు ఆ ప్రశ్నకు సమాధానం లేదు."
          : "क्षमस्व, मम उत्तरं नास्ति।",
        false
      );
    }, 700);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });

  return footerContainer;
}

document.body.appendChild(createFooter());
