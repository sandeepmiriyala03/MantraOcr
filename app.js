document.addEventListener('DOMContentLoaded', () => {
  let ritualsMantras = JSON.parse(localStorage.getItem('ritualsMantras')) || {
        sriGaneshayaNamah: {
            title: "యాజ్ఞవల్క్య ప్రార్థన",
            description: "యాజ్ఞవల్క్య",
            instructions: [{
                mantra: [
                    [{ char: "ఓం" }, { char: "వందేహం" }, { char: "మంగళాత్మానం" }, { char: "భాస్వంతం" }, { char: "వేద" }, { char: "విగ్రహమ్" }, { char: "|" }, { char: "యజ్ఞవల్క్యం" }, { char: "మునిశ్రేష్ఠం" }, { char: "జిష్ణుం" }, { char: "హరిహర" }, { char: "ప్రభుమ్" }, { char: "||" }],
                    [{ char: "జితేంద్రియం" }, { char: "జితక్రోధం" }, { char: "సదాధ్యాన" }, { char: "పరాయణం" }, { char: "|" }, { char: "ఆనందనిలయం" }, { char: "వందే" }, { char: "యోగానంద" }, { char: "మునీశ్వరమ్" }, { char: "||" }],
                    [{ char: "ఏవం" }, { char: "ద్వాదశ" }, { char: "నామాని" }, { char: "త్రిసంధ్యా" }, { char: "యః" }, { char: "పఠేన్నరః" }, { char: "!" }, { char: "యోగీశ్వర" }, { char: "ప్రసాదేన" }, { char: "విద్యావాన్" }, { char: "ధనవాన్" }, { char: "భవేడ్" }, { char: "||" }],
                    [{ char: "ఓం" }, { char: "శ్రీ" }, { char: "యాజ్ఞవల్క్య" }, { char: "గురుభ్యో" }, { char: "నమః" }, { char: "|" }, { char: "కణ్వకాత్యాయనాది" }, { char: "మహర్షిభ్యో" }, { char: "నమః" }, { char: "|" }]
                ]
            }]
        },
        ApavitrahPavitra: {
            title: "అపవిత్రః",
            description: "అపవిత్రః.",
            instructions: [{
                mantra: [
                    [{ char: "అపవిత్రః" }, { char: "పవిత్రోవా" }, { char: "సర్వావస్థాం" }, { char: "గతోపివా" }],
                    [{ char: "యస్స్మరేత్పుణ్డరీకాక్షం" }, { char: "సబాహ్యాభ్యన్తర" }, { char: "శ్శుచిః" }],
                    [{ char: "గోవిన్దేతి" }, { char: "సదాస్నానం।" }],
                    [{ char: "గోవిన్దేతి" }, { char: "సదా" }, { char: "జపం" }],
                    [{ char: "గోవిన్దేతి" }, { char: "సదా" }, { char: "ధ్యానం।" }],
                    [{ char: "సదా" }, { char: "గోవిన్ద" }, { char: "కీర్తనమ్॥" }],
                    [{ char: "శ్రీ" }, { char: "పుండరీకాక్ష" }, { char: "పుండరీకాక్ష" }, { char: "పుండరీకాక్ష" }]
                ]
            }]
        },
        AchmanamMantras: {
            title: " ఆచమన మంత్రం",
            description: " ఆచమన మంత్రం",
            instructions: [{ mantra: [ [ { char: "ఓం" }, { char: "కేశవాయ" }, { char: "స్వాహా" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "నారాయణాయ" }, { char: "స్వాహా" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "మాధవాయ" }, { char: "స్వాహా" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "గోవిందాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "విష్ణవే" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "మధుసూదనాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "త్రివిక్రమాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "వామనాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "శ్రీధరాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "హృషీకేశాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "పద్మనాభాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "దామోదరాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "సంకర్శణాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "వాసుదేవాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "ప్రద్యుమ్నాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "అనిరుద్ధాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "పురుషోత్తమాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "అచ్యుతాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "జనార్ధనాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "ఉపేంద్రాయ" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "హరివే" }, { char: "నమః" } ] ] }, { mantra: [ [ { char: "ఓం" }, { char: "శ్రీకృష్ణాయ" }, { char: "నమః" } ] ] }]
        },
        BrahmaKarma: {
            title: "బ్రహ్మ కర్మ భూమి ప్రార్థనము",
            description: "భూమి ప్రార్థనము",
            instructions: [{ mantra: " ఉగ్రభూతపిశాచాస్తే ఇత్యేతే భూమి భారకాః | భూతానామవిరోధేన బ్రహ్మ కర్మ సమారభే ॥" }, { mantra: "ఓం పృధ్విత్యస్య మేరుపృష్ఠ ఋషిః। కూర్మో దేవతా। సుతలం ఛందః। ఆసనే వినియోగః ||" }, { mantra: "ఓం పృధ్వీ త్వయా ధృతా లోకా దేవిత్వం విష్ణునాధృతా। త్వం చ ధారయ మాం దేవి పవిత్రం కురుచాసనమ్।" }]
        },
        Pranayama: {
            title: "ప్రాణాయామము",
            description: "ప్రాణాయామము",
            instructions: [{ mantra: "ప్రణవస్య:పరబ్రహ్మ ఋషిః | దైవీగాయత్రీఛన్దః | పరమాత్మా దేవతా |  సప్తానాం వ్యాహృతీనాం క్రమేణ విశ్వామిత్ర జమదగ్ని భరద్వాజ గౌతమ అత్రి  వశిష్ఠ కశ్యపాః ఋషయః | " }, { mantra: "గాయత్రి ఉష్ణక్ అనుష్టుప్ బృహతీ పంక్తి | త్రిష్టుప్ జగత్యః ఛన్దాంసి | అగ్ని వాయు సూర్య బృహస్పతి వరుణేన్ద విశ్వేదేవా దేవాతాః | తత్సవితురిత్యస్య : విశ్వామిత్రఋషిః | గాయత్రీఛ న్దః | సవితా దేవతా |" }, { mantra: "శిరోమన్తస్య : ప్రజాపతిరృషిః | యజుశ్ఛన్దః। బ్రహ్మ-అగ్ని-వాయు-సూర్యా దేవతాః | సర్వేషాం ప్రాణాయామే వినియోగః||" }, { mantra: "ఓమ్. భూః | ఓమ్ భువః | ఓగ్స్ స్స్వః | ఓం మహః | ఓం జనః | ఓం తపః | ఓగ్గాఁ సత్యమ్ |" }, { mantra: [[{ char: "ఓం త " }, { char: " త్స ", pitch: "high" }, { char: " వి ", pitch: "low" }, { char: "తు ర్వ" }, { char: "రే", pitch: "high" }, { char: "ణ్యం ", pitch: "low" }, { char: "।"}, { char: "భ"}, { char: " ర్గో ", pitch: "high" }, { char: " దే", pitch: "low" }, { char: "వ"}, { char: "స్య", pitch: "high" }, { char: "ధీమహి | " }, { char: "ధి"}, { char: "యో ", pitch: "low" }, { char: "యో "}, { char: " నః ", pitch: "high" }, { char: " ప్ర "}, { char: " చో ", pitch: "low" }, { char: " ద ", }, { char: " యా ", pitch: "high" }, { char: " త। "}], [{ char: "ఓం ఆ " }, { char: "పో ", pitch: "low" }, { char: "జ్యో"}, { char: "తీ ", pitch: "low" }, { char: "ర"}, { char: " సో ", pitch: "low" }, { char: " మృ"}, { char: " తం ", pitch: "low" }, { char: "బ్ర"}, { char: " హ్మ ", pitch: "low" }, { char: "భూర్భువస్స్వరోమ్ ॥" }]] }]
        },
        Sankalpa: {
            title: "సంకల్పము",
            description: "సంకల్పము ,కలశము ",
            instructions: [{ mantra: " (మమ) ఉపాత్తదురితక్షయ ద్వారా శ్రీ పరమేశ్వరముద్దిశ్య... ప్రీత్యర్థం శుభే శోభనే మూహూర్తే శ్రీమహావిష్ణోరాజ్ఞయా ప్రవర్తమానస్య అద్య బ్రహ్మణః | ద్వితీయపరార్థే | శ్వేతవరాహ కల్పే | వైవస్వతమన్వంతరే | కలియుగే | ప్రథమపాదే | జంబూద్వీపే | భరతవర్షే | భరతఖండే | మేరోః దక్షిణదిగ్భాగే। శ్రీశైలస్య ఈశాన్యప్రదేశే | గంగా గోదావర్యోః మధ్యప్రదేశ్ | ఆగ్నేయకోణే | ఆంధ్రదేశే, అస్మిన్వర్తమాన వ్యవహారిక చాంద్రమానేన.... సంవత్సరేశుభయోగే... శుభకరణ ఏవం గుణ విశేషణ విశిష్టాయాం శుభతిదౌ శ్రీమాన్...గోత్రః....నామధేయః, శ్రీమతః గోత్రస్య.... నామధేయస్య (మమ) శ్రాత -స్మార్త - నిత్య - నైమిత్తిక - కామ్యకర్మ అనుష్ఠాన యోగ్యతా ఫల సిధ్యర్థం ప్రాతః సంధ్యాముపాసిష్యే (మాధ్యాహ్నిక సంధ్యాముపాసిష్యే), (సాయం సంధ్యాముపాసిష్యే) ॥" }, { mantra: "గంగే చ ! యమునే ! కృష్ణ ! గోదావరి ! సరస్వతి । నర్మదే ! సింధు ! కావేరి జలేస్మిన్ సన్నిధిం కురు ॥" }]
        },
        Apohisthati: {
            title: "ఆపోహిష్ఠతి",
            description: "ఆపోహిష్ఠతి",
            instructions: [{ mantra: "ఆపోహిష్ఠతి తిసృణాం సింధుద్వీప ఋషిః|గాయత్రీ ఛన్దః|ఆపో దేవతా।మార్జనే వినియోగః॥" }, { mantra: [[{ char: "ఓం ఆ" }, { char: "పో", pitch: "low" }, { char: "హిష్ఠా " }, { char: "మ", pitch: "high" }, { char: "యో ", pitch: "low" }, { char: "భువః"}, { char: "ఓమ్ తా" }, { char: "న ", pitch: "high"}, { char: "ఊ ", pitch: "low" }, { char: "ర్జే "}, { char: "ద ", pitch: "high" }, { char: "ధాతన |"}, { char: "ఓమ్ "}, { char: "మ", pitch: "low" }]] }]
        }
    };


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

  function updateStatus(message, type = 'info') {
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
  }

  async function initWorker() {
    updateStatus("Initializing OCR engine...", 'info');
    try {
      worker = await Tesseract.createWorker({
        langPath: "https://cdn.jsdelivr.net/npm/tessdata@4.0.0"
      });
      await worker.load();
      await worker.loadLanguage('tel');
      await worker.initialize('tel');

      worker.setLogger(({ status, progress }) => {
        if(status === 'recognizing text') {
          updateStatus(`Recognizing text: ${(progress * 100).toFixed(2)}%`);
        }
      });

      updateStatus("OCR engine ready. Upload an image to start.", "success");
      renderMantraTabs();
    } catch(error) {
      console.error("OCR initialization error:", error);
      updateStatus("Failed to initialize OCR engine.", "error");
    }
  }
  initWorker();

  imageInput.addEventListener('change', () => {
    if(!imageInput.files.length) return;
    currentFile = imageInput.files[0];
    preview.src = URL.createObjectURL(currentFile);
    preview.style.display = 'block';
    updateStatus("Image loaded. Click 'Start OCR' to process", "info");
    btnOcr.disabled = false;
    ocrTextarea.value = "";
    pitchMarks = [];
  });

  btnOcr.addEventListener('click', async () => {
    if(!currentFile || !worker) return;
    btnOcr.disabled = true;
    ocrSpinner.style.display = 'inline-block';
    updateStatus("Performing OCR...", "info");
    try {
      const { data } = await worker.recognize(currentFile, 'tel');
      const sanitized = data.text.replace(/[\u030D\u0323]/g, '').trim();
      ocrTextarea.value = sanitized;

      const segments = Array.from(new Intl.Segmenter('te', { granularity: 'grapheme' }).segment(sanitized));
      pitchMarks = Array(segments.length).fill('none');

      updateStatus("OCR complete. Select text and mark pitch.", "success");
    } catch(error) {
      console.error("OCR error:", error);
      updateStatus("OCR failed. Try again.", "error");
    } finally {
      btnOcr.disabled = false;
      ocrSpinner.style.display = 'none';
    }
  });

  function getGraphemeIndices(text, start, end) {
    const segments = Array.from(new Intl.Segmenter('te', { granularity: 'grapheme' }).segment(text));
    let indices = [];
    let charIdx = 0;
    for(let i=0; i<segments.length; i++) {
      const seg = segments[i].segment;
      const segmentEnd = charIdx + seg.length;
      if(segmentEnd > start && charIdx < end) {
        indices.push(i);
      }
      charIdx = segmentEnd;
    }
    return indices;
  }

  function preparePitches(pitchType) {
    const start = ocrTextarea.selectionStart;
    const end = ocrTextarea.selectionEnd;
    if(start === end) {
      alert("Select text first");
      return;
    }
    const indices = getGraphemeIndices(ocrTextarea.value, start, end);
    if(!indices.length) {
      alert("Select text again");
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
    btnSaveMantra.textContent = "Save New";
    currentMantraKey = null;
  });

  btnSaveMantra.addEventListener('click', () => {
    const title = mantraTitleInput.value.trim();
    if(!title) return alert("Please enter title");
    const description = mantraDescriptionInput.value.trim();
    const text = ocrTextarea.value.trim();
    if(!text) return alert("No text to save");

    const key = title.replace(/\s+/g, '');

    if(key !== currentMantraKey && ritualsMantras[key]) {
      return alert("Title exists");
    }

    const segments = Array.from(new Intl.Segmenter('te', { granularity: 'grapheme' }).segment(text));
    let instructions = [];
    let currentLine = [];
    segments.forEach((seg) => {
      const char = seg.segment;
      if(char === '\n') {
        if(currentLine.length) {
          instructions.push(currentLine);
          currentLine = [];
        }
      } else {
        let syl = { char };
        const index = instructions.length * currentLine.length; // NOTE: can be improved
        if(pitchMarks[index] && pitchMarks[index] !== 'none') syl.pitch = pitchMarks[index];
        currentLine.push(syl);
      }
    });
    if(currentLine.length) {
      instructions.push(currentLine);
    }

    const newMantra = { title, description, instructions: [{ mantra: instructions }] };

    if(currentMantraKey && currentMantraKey !== key) {
      delete ritualsMantras[currentMantraKey];
    }

    ritualsMantras[key] = newMantra;
    currentMantraKey = key;
    localStorage.setItem('ritualsMantras', JSON.stringify(ritualsMantras));

    updateStatus(`Saved mantra "${title}"`);
    renderMantraTabs();
    loadMantra(key);
    mantraTitleInput.value = '';
    mantraDescriptionInput.value = '';
    btnSaveMantra.textContent = "Save New";
  });

  function renderMantraTabs() {
    tabContainer.innerHTML = '';
    Object.entries(ritualsMantras).forEach(([key, mantra]) => {
      const btn = document.createElement('button');
      btn.className = 'tab-button';
      btn.setAttribute('data-key', key);
      btn.textContent = mantra.title;

      const delBtn = document.createElement('button');
      delBtn.textContent = 'X';
      delBtn.className = 'delete-btn';
      delBtn.title = 'Delete mantra';

      delBtn.onclick = e => {
        e.stopPropagation();
        if(confirm(`Delete "${mantra.title}"?`)) {
          delete ritualsMantras[key];
          localStorage.setItem('ritualsMantras', JSON.stringify(ritualsMantras));
          updateStatus(`Deleted "${mantra.title}"`);
          renderMantraTabs();
          if(currentMantraKey === key) {
            currentMantraKey = null;
            mantraTitleDisplay.textContent = '';
            mantraDescriptionDisplay.textContent = '';
            mantraContentDisplay.textContent = 'Select a mantra';
            btnEditMantra.disabled = true;
            btnSaveMantra.textContent = 'Save New';
            mantraTitleInput.value = '';
            mantraDescriptionInput.value = '';
            ocrTextarea.value = '';
            pitchMarks = [];
          }
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

  function loadMantra(key) {
    const mantra = ritualsMantras[key];
    if(!mantra) {
      updateStatus('Mantra not found', 'error');
      return;
    }
    currentMantraKey = key;

    let html = '';
    (Array.isArray(mantra.instructions) ? mantra.instructions : []).forEach(instr => {
      if(typeof instr.mantra === 'string') {
        html += `<p>${instr.mantra}</p>`;
      } else if(Array.isArray(instr.mantra)) {
        instr.mantra.forEach(line => {
          html += '<p>';
          line.forEach(syl => {
            let pitchClass = syl.pitch ? ` ${syl.pitch}` : '';
            html += `<span class="pitch-marked-char${pitchClass}">${syl.char}</span>`;
          });
          html += '</p>';
        });
      }
    });
    mantraTitleDisplay.textContent = mantra.title;
    mantraDescriptionDisplay.textContent = mantra.description || '';
    mantraContentDisplay.innerHTML = html;

    const hasPitchMarks = (mantra.instructions || []).some(instr =>
      Array.isArray(instr.mantra) && instr.mantra.some(line => line.some(syl => syl.pitch))
    );
    btnEditMantra.disabled = !hasPitchMarks;

    updateStatus(`Loaded mantra "${mantra.title}"`, 'success');
  }

  btnEditMantra.addEventListener('click', () => {
    if(!currentMantraKey) {
      alert('Please select a mantra first.');
      return;
    }
    const mantra = ritualsMantras[currentMantraKey];
    mantraTitleInput.value = mantra.title;
    mantraDescriptionInput.value = mantra.description;

    let fullText = '';
    let newPitchMarks = [];

    (mantra.instructions || []).forEach(instr => {
      if(typeof instr.mantra === 'string') {
        fullText += instr.mantra;
      } else if(Array.isArray(instr.mantra)) {
        instr.mantra.forEach(line => {
          line.forEach(syl => {
            fullText += syl.char;
            newPitchMarks.push(syl.pitch || 'none');
          });
          fullText += '\n';
        });
      }
    });
    ocrTextarea.value = fullText.trim();
    pitchMarks = newPitchMarks;

    updateStatus(`Editing "${mantra.title}".`);
    btnSaveMantra.textContent = 'Save Mantra';
    mantraTitleInput.focus();
  });

});
