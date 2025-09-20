const imageUpload = document.getElementById('imageUpload');
const image = document.getElementById('image');
const cropBtn = document.getElementById('cropBtn');
const ocrBtn = document.getElementById('ocrBtn');
const copyBtn = document.getElementById('copyBtn');
const textOutput = document.getElementById('textOutput');
const latexRender = document.getElementById('latexRender');
const greekSymbolTable = document.getElementById('greekSymbolTable');

let cropper = null;
let croppedCanvas = null;
let rawOCRText = '';
let latexOutput = '';

imageUpload.addEventListener('change', () => {
  const file = imageUpload.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  image.src = url;
  image.style.display = 'block';

  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
  cropper = new Cropper(image, {
    viewMode: 1,
    autoCropArea: 1,
    movable: true,
    zoomable: true,
    scalable: false,
    cropBoxResizable: true
  });

  cropBtn.disabled = false;
  ocrBtn.disabled = true;
  copyBtn.disabled = true;
  textOutput.value = '';
  latexRender.innerHTML = 'No LaTeX output yet.';
  greekSymbolTable.innerHTML = 'No Greek symbols recognized yet.';
});

cropBtn.addEventListener('click', () => {
  if (!cropper) return;

  croppedCanvas = cropper.getCroppedCanvas();

  if (!croppedCanvas) return;

  image.src = croppedCanvas.toDataURL();

  cropper.destroy();
  cropper = null;

  cropBtn.disabled = true;
  ocrBtn.disabled = false;
  copyBtn.disabled = true;

  textOutput.value = 'Ready for OCR. Click "Run OCR".';
  latexRender.innerHTML = 'No LaTeX output yet.';
});

// Symbol to LaTeX conversion mapping
function convertSymbolsToLatex(text) {
  const symbolMap = {
    '×': '\\times',
    '÷': '\\div',
    'α': '\\alpha',
    'β': '\\beta',
    'γ': '\\gamma',
    'δ': '\\delta',
    'Δ': '\\Delta',
    'θ': '\\theta',
    'π': '\\pi',
    '√': '\\sqrt{}',
    '∫': '\\int',
    '∑': '\\sum',
    '∞': '\\infty',
    '≈': '\\approx',
    '≠': '\\neq',
    '≤': '\\leq',
    '≥': '\\geq',
  };

  let latexText = text;
  for (const [char, latex] of Object.entries(symbolMap)) {
    latexText = latexText.split(char).join(latex);
  }
  latexText = latexText.replace(/\n{2,}/g, '\n\n');
  return latexText.trim();
}

// Greek symbols map for table
const greekMap = {
  'α': {name: 'Alpha', latex: '\\alpha'},
  'β': {name: 'Beta', latex: '\\beta'},
  'γ': {name: 'Gamma', latex: '\\gamma'},
  'δ': {name: 'Delta', latex: '\\delta'},
  'Δ': {name: 'Delta (Capital)', latex: '\\Delta'},
  'θ': {name: 'Theta', latex: '\\theta'},
  'π': {name: 'Pi', latex: '\\pi'},
  'ρ': {name: 'Rho', latex: '\\rho'},
  'σ': {name: 'Sigma', latex: '\\sigma'},
  'τ': {name: 'Tau', latex: '\\tau'},
  'φ': {name: 'Phi', latex: '\\phi'},
  'ω': {name: 'Omega', latex: '\\omega'},
};

function createGreekSymbolTable(text) {
  const foundSymbols = new Set();
  for (const char of text) {
    if (greekMap[char]) {
      foundSymbols.add(char);
    }
  }
  if (foundSymbols.size === 0) {
    return '<p>No Greek symbols found in OCR text.</p>';
  }
  let tableHTML = `
    <table>
      <thead>
        <tr><th>Symbol</th><th>Name</th><th>LaTeX Code</th></tr>
      </thead>
      <tbody>
  `;
  foundSymbols.forEach(symbol => {
    const {name, latex} = greekMap[symbol];
    tableHTML += `<tr>
      <td style="font-weight: bold; font-size: 1.5rem;">${symbol}</td>
      <td>${name}</td>
      <td><code>${latex}</code></td>
    </tr>`;
  });
  tableHTML += '</tbody></table>';
  return tableHTML;
}

ocrBtn.addEventListener('click', async () => {
  if (!croppedCanvas) return;

  textOutput.value = 'Performing OCR, please wait...';
  latexRender.innerHTML = 'Processing OCR...';
  greekSymbolTable.innerHTML = '';

  try {
    const { data: { text } } = await Tesseract.recognize(croppedCanvas, 'eng', {
      logger: (m) => {
        // optionally display progress
      }
    });

    rawOCRText = text.trim();
    textOutput.value = rawOCRText || '(No text recognized)';

    latexOutput = convertSymbolsToLatex(rawOCRText);

    try {
      katex.render(latexOutput, latexRender, {
        throwOnError: false,
        errorColor: '#cc0000'
      });
    } catch (e) {
      latexRender.innerHTML = 'Error rendering LaTeX output.';
    }

    const greekSymbolsHTML = createGreekSymbolTable(rawOCRText);
    greekSymbolTable.innerHTML = greekSymbolsHTML;

    copyBtn.disabled = false;

  } catch (error) {
    textOutput.value = 'OCR error: ' + error.message;
    latexRender.innerHTML = 'Error occurred during OCR.';
    greekSymbolTable.innerHTML = '';
    copyBtn.disabled = true;
  }
});

copyBtn.addEventListener('click', () => {
  if (!latexOutput) return;
  navigator.clipboard.writeText(latexOutput);
  alert('LaTeX code copied to clipboard!');
});
