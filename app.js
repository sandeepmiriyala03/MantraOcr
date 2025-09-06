document.addEventListener('DOMContentLoaded', () => {
  // Load saved mantras or use default if none saved
  let ritualsMantras = JSON.parse(localStorage.getItem('ritualsMantras')) || {
    sriGaneshayaNamah: {
      title: "యాజ్ఞవల్క్య ప్రార్థన",
      description: "యాజ్ఞవల్క్య",
      instructions: [{
        mantra: [
          [
            { char: "ఓం" }, { char: "వందేహం" }, { char: "మంగళాత్మానం" },
            { char: "భాస్వంతం" }, { char: "వేద" }, { char: "విగ్రహమ్" }, { char: "|" },
            { char: "యజ్ఞవల్క్యం" }, { char: "మునిశ్రేష్ఠం" }, { char: "జిష్ణుం" },
            { char: "హరిహర" }, { char: "ప్రభుమ్" }, { char: "||" }
          ],
          // More lines here...
        ]
      }]
    }
  };

  // Select all relevant DOM elements
  const statusElement = document.getElementById('status');
  const imageInput = document.getElementById('imageInput');
  const preview = document.getElementById('preview');
  const btnOcr = document.getElementById('btnOcr');
  const ocrSpinner = document.getElementById('ocrSpinner');
  const ocrTextarea = document.getElementById('ocrText');
  const btnPitchHigh = document.getElementById('btnPitchHigh');
  const btnPitchLow = document.getElementById('btnPitchLow');
  const btnClear = document.getElementById('btnClear');
  const mantraTitleInput = document.getElementById('mantraTitle');
  const mantraDescriptionInput = document.getElementById('mantraDescription');
  const btnSaveMantra = document.getElementById('btnSaveMantra');
  const tabContainer = document.getElementById('tabContainer');
  const mantraTitleDisplay = document.getElementById('mantraTitleDisplay');
  const mantraDescriptionDisplay = document.getElementById('mantraDescriptionDisplay');
  const mantraContentDisplay = document.getElementById('mantraContentDisplay');
  const btnEditMantra = document.getElementById('btnEditMantra');
  const btnDownloadMantra = document.getElementById('btnDownloadMantra');

  let worker;
  let currentFile = null;
  let pitchMarks = [];
  let currentMantraKey = null;

  // Function to update status text and style
  function updateStatus(message, type = 'info') {
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
  }

  // Initialize OCR Worker (runs once)
  async function initWorker() {
    updateStatus("Initializing OCR engine...", 'info');
    try {
      worker = await Tesseract.createWorker({
        langPath: 'https://cdn.jsdelivr.net/npm/tessdata@4.0.0',
      });
      await worker.load();
      await worker.loadLanguage('tel');
      await worker.initialize('tel');
      worker.setLogger(({ status, progress }) => {
        if (status === 'recognizing text') {
          updateStatus(`Recognizing text: ${(progress * 100).toFixed(2)}%`);
        }
      });
      updateStatus("OCR engine ready. Upload an image to start.", "success");

      renderMantraTabsAndSelectFirst();
    } catch (e) {
      console.error(e);
      updateStatus("Failed to initialize OCR engine.", "error");
    }
  }

  initWorker();

  // Image upload handler
  imageInput.addEventListener('change', () => {
    if (!imageInput.files.length) return;
    currentFile = imageInput.files[0];
    preview.src = URL.createObjectURL(currentFile);
    preview.style.display = 'block';
    updateStatus("Image loaded. Click 'Start OCR' to process", 'info');
    btnOcr.disabled = false;
    ocrTextarea.value = '';
    pitchMarks = [];
  });

  // OCR button click handler
  btnOcr.addEventListener('click', async () => {
    if (!currentFile || !worker) return;
    btnOcr.disabled = true;
    ocrSpinner.style.display = 'inline-block';
    updateStatus("Performing OCR...", 'info');
    try {
      const { data } = await worker.recognize(currentFile, 'tel');
      const sanitizedText = data.text.replace(/[\u030D\u0323]/g, '').trim();
      ocrTextarea.value = sanitizedText;

      const segments = Array.from(new Intl.Segmenter('te', { granularity: 'grapheme' }).segment(sanitizedText));
      pitchMarks = new Array(segments.length).fill('none');

      updateStatus("OCR complete. Select text and mark pitch.", 'success');
    } catch (error) {
      console.error(error);
      updateStatus("OCR failed. Try again.", 'error');
    } finally {
      ocrSpinner.style.display = 'none';
      btnOcr.disabled = false;
    }
  });

  // Helpers for pitch marking
  function getGraphemeIndices(text, selectionStart, selectionEnd) {
    const segments = Array.from(new Intl.Segmenter('te', { granularity: 'grapheme' }).segment(text));
    let indices = [];
    let charIndex = 0;
    for (let i = 0; i < segments.length; i++) {
      const segLen = segments[i].segment.length;
      if (charIndex + segLen > selectionStart && charIndex < selectionEnd) {
        indices.push(i);
      }
      charIndex += segLen;
    }
    return indices;
  }

  function preparePitches(pitchType) {
    const start = ocrTextarea.selectionStart;
    const end = ocrTextarea.selectionEnd;
    if (start === end) {
      alert("Please select some text in the OCR output to mark pitch.");
      return;
    }
    const indices = getGraphemeIndices(ocrTextarea.value, start, end);
    if (indices.length === 0) {
      alert("Please select valid text range.");
      return;
    }
    indices.forEach(i => pitchMarks[i] = pitchType);
    updateStatus(`Marked ${pitchType} pitch.`);
  }

  btnPitchHigh.addEventListener('click', () => preparePitches('high'));
  btnPitchLow.addEventListener('click', () => preparePitches('low'));

  btnClear.addEventListener('click', () => {
    ocrTextarea.value = '';
    imageInput.value = '';
    preview.style.display = 'none';
    btnOcr.disabled = true;
    pitchMarks = [];
    mantraTitleInput.value = '';
    mantraDescriptionInput.value = '';
    updateStatus("Cleared all.");
    btnSaveMantra.textContent = "Save New Mantra ✨";
    currentMantraKey = null;
    renderMantraTabsAndSelectFirst();
  });

  // Save mantra handler
  btnSaveMantra.addEventListener('click', () => {
    const title = mantraTitleInput.value.trim();
    if (!title) return alert("Please enter a mantra title.");
    const description = mantraDescriptionInput.value.trim();
    const text = ocrTextarea.value.trim();
    if (!text) return alert("OCR output is empty.");

    const key = title.replace(/\s+/g, '');
    if (key !== currentMantraKey && ritualsMantras[key]) {
      alert("This title already exists.");
      return;
    }

    const segments = Array.from(new Intl.Segmenter('te', { granularity: 'grapheme' }).segment(text));
    let instructions = [];
    let currentLine = [];

    for (let i = 0; i < segments.length; i++) {
      const char = segments[i].segment;
      if (char === '\n') {
        if (currentLine.length > 0) {
          instructions.push(currentLine);
          currentLine = [];
        }
      } else {
        let syl = { char };
        if (pitchMarks[i] && pitchMarks[i] !== 'none') syl.pitch = pitchMarks[i];
        currentLine.push(syl);
      }
    }
    if (currentLine.length > 0) {
      instructions.push(currentLine);
    }

    const newMantra = {
      title,
      description,
      instructions: [{ mantra: instructions }],
    };

    if (currentMantraKey && currentMantraKey !== key) {
      delete ritualsMantras[currentMantraKey];
    }
    ritualsMantras[key] = newMantra;
    currentMantraKey = key;

    localStorage.setItem('ritualsMantras', JSON.stringify(ritualsMantras));
    updateStatus(`Saved mantra "${title}".`, 'success');
    renderMantraTabsAndSelectFirst();
    loadMantra(key);

    mantraTitleInput.value = '';
    mantraDescriptionInput.value = '';
    btnSaveMantra.textContent = "Save New Mantra ✨";
  });

  // Render tabs and select first mantra on load or after changes
  function renderMantraTabsAndSelectFirst() {
    renderMantraTabs();
    const firstTab = tabContainer.querySelector('button.tab-button');
    if (firstTab) {
      firstTab.classList.add('active');
      loadMantra(firstTab.getAttribute('data-key'));
    } else {
      mantraTitleDisplay.textContent = '';
      mantraDescriptionDisplay.textContent = '';
      mantraContentDisplay.textContent = 'No mantras found.';
      btnEditMantra.disabled = true;
    }
  }

  // Render mantra tabs dynamically
  function renderMantraTabs() {
    tabContainer.innerHTML = '';
    Object.entries(ritualsMantras).forEach(([key, mantra]) => {
      if (!mantra.title) return;

      const btn = document.createElement('button');
      btn.className = 'tab-button';
      btn.setAttribute('data-key', key);
      btn.textContent = mantra.title;
      btn.type = 'button';

      const delBtn = document.createElement('button');
      delBtn.textContent = 'X';
      delBtn.className = 'delete-btn';
      delBtn.title = 'Delete mantra';
      delBtn.type = 'button';

      delBtn.onclick = e => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete "${mantra.title}"?`)) {
          delete ritualsMantras[key];
          localStorage.setItem('ritualsMantras', JSON.stringify(ritualsMantras));
          updateStatus(`Deleted mantra "${mantra.title}".`, 'success');
          renderMantraTabsAndSelectFirst();
        }
      };

      btn.appendChild(delBtn);

      btn.onclick = () => {
        [...tabContainer.children].forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadMantra(key);
      };

      tabContainer.appendChild(btn);
    });
  }

  // Load and display mantra content when tab selected
  function loadMantra(key) {
    const mantra = ritualsMantras[key];
    if (!mantra) {
      updateStatus('Mantra not found.', 'error');
      return;
    }
    currentMantraKey = key;

    mantraTitleDisplay.textContent = mantra.title || '';
    mantraDescriptionDisplay.textContent = mantra.description || '';

    let html = '';
    if (Array.isArray(mantra.instructions)) {
      mantra.instructions.forEach(instr => {
        if (typeof instr.mantra === 'string') {
          html += `<p>${instr.mantra}</p>`;
        } else if (Array.isArray(instr.mantra)) {
          instr.mantra.forEach(line => {
            html += '<p>';
            line.forEach(charObj => {
              const pitchClass = charObj.pitch ? ` ${charObj.pitch}` : '';
              html += `<span class="pitch-marked-char${pitchClass}">${charObj.char}</span>`;
            });
            html += '</p>';
          });
        }
      });
    }
    mantraContentDisplay.innerHTML = html;

    // Enable edit only if any pitch marks exist
    const hasPitch = mantra.instructions.some(instr => 
      Array.isArray(instr.mantra) && instr.mantra.some(line => line.some(charObj => charObj.pitch))
    );
    btnEditMantra.disabled = !hasPitch;

    updateStatus(`Loaded mantra "${mantra.title}".`, 'success');
  }

  btnEditMantra.addEventListener('click', () => {
    if (!currentMantraKey) {
      alert('Please select a mantra first to edit.');
      return;
    }
    const mantra = ritualsMantras[currentMantraKey];
    mantraTitleInput.value = mantra.title || '';
    mantraDescriptionInput.value = mantra.description || '';

    let fullText = '';
    let newPitchMarks = [];

    (mantra.instructions || []).forEach(instr => {
      if (typeof instr.mantra === 'string') {
        fullText += instr.mantra;
      } else if (Array.isArray(instr.mantra)) {
        instr.mantra.forEach(line => {
          line.forEach(charObj => {
            fullText += charObj.char;
            newPitchMarks.push(charObj.pitch || 'none');
          });
          fullText += '\n';
        });
      }
    });

    ocrTextarea.value = fullText.trim();
    pitchMarks = newPitchMarks;

    updateStatus(`Editing mantra "${mantra.title}".`, 'info');
    btnSaveMantra.textContent = 'Save Changes';
    mantraTitleInput.focus();
  });

});
