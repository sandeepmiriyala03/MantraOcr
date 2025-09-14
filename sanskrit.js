let allBooks = {};
let currentBookKey = null;
let currentSectionKey = null;
let currentMantraKey = null;
let worker;
let pitchMarks = [];

const statusElement = document.getElementById('status');
const bookSelect = document.getElementById('bookSelect');
const sectionSelect = document.getElementById('sectionSelect');
const newBookTitleInput = document.getElementById('newBookTitle');
const createNewBookBtn = document.getElementById('createNewBookBtn');
const deleteBookBtn = document.getElementById('deleteBookBtn');
const newSectionTitleInput = document.getElementById('newSectionTitle');
const addNewSectionBtn = document.getElementById('addNewSectionBtn');
const deleteSectionBtn = document.getElementById('deleteSectionBtn');
const imageInput = document.getElementById('imageInput');
const preview = document.getElementById('preview');
const btnOcr = document.getElementById('btnOcr');
const ocrSpinner = document.getElementById('ocrSpinner');
const ocrTextarea = document.getElementById('ocrText');

const btnClear = document.getElementById('btnClear');
const mantraTitleInput = document.getElementById('mantraTitle');
const mantraDescriptionInput = document.getElementById('mantraDescription');
const btnSaveMantra = document.getElementById('btnSaveMantra');
const mantraTabContainer = document.getElementById('mantraTabContainer');
const mantraTitleDisplay = document.getElementById('mantraTitleDisplay');
const mantraDescriptionDisplay = document.getElementById('mantraDescriptionDisplay');
const mantraContentDisplay = document.getElementById('mantraContentDisplay');
const btnEditMantra = document.getElementById('btnEditMantra');
const btnDownloadMantra = document.getElementById('btnDownloadMantra');
const sectionCreationSection = document.getElementById('sectionCreationSection');
const ocrSection = document.getElementById('ocrSection');
const viewMantraSection = document.getElementById('viewMantraSection');
const helperToggleBtn = document.getElementById('helperToggleBtn');
const helperContent = document.getElementById('helperContent');
const helperArrow = document.getElementById('helperArrow');

function updateStatus(message, type = 'info') {
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;
}

function saveBookData() {
    try {
        localStorage.setItem('aksharadharaSanBooks', JSON.stringify(allBooks));
    } catch (e) {
        updateStatus("दत्तांशस्य रक्षणे त्रुटिः। कृपया ब्राउजर् सेटिंग्स् पश्यन्तु।.", 'error');
    }
}

function loadBookData() {
    try {
        const savedData = localStorage.getItem('aksharadharaSanBooks');
        if (savedData) {
            allBooks = JSON.parse(savedData);
        }
    } catch (e) {
        console.error("Failed to load data from local storage:", e);
    }
}

async function initWorker() {
    updateStatus("OCR इञ्जिनस्य आरम्भः...", 'info');
    loadBookData();
    renderBookSelect();
    try {
        worker = await Tesseract.createWorker({
            langPath: "https://tessdata.projectnaptha.com/4.0.0",
            logger: m => {
                if (m.status === "recognizing text") {
                    updateStatus(`पाठपरिचयः : १. ${(m.progress * 100).toFixed(2)}%`, 'info');
                }
            }
        });
        await worker.loadLanguage("san");
        await worker.initialize("san");
        updateStatus("ओसीआर इञ्जिनं सज्जम् अस्ति। पुस्तकं रचयन्तु वा चयनं कुर्वन्तु।", 'success');
    } catch (error) {
        console.error("OCR आरम्भदोषः:", error);
        updateStatus("OCR इञ्जिनं आरभ्यतुं असफलम्। कृपया स्वस्य संजालसंयोजनं पश्यन्तु।", 'error');
    }
}
window.onload = initWorker;

function renderBookSelect() {
    bookSelect.innerHTML = '<option value="" disabled selected>पुस्तकं चिनुत</option>';
    if (Object.keys(allBooks).length > 0) {
        for (const key in allBooks) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = allBooks[key].title;
            bookSelect.appendChild(option);
        }
        document.getElementById('sectionCreationSection').style.display = 'block';
    } else {
        document.getElementById('sectionCreationSection').style.display = 'none';
    }
}

function renderSectionSelect() {
    sectionSelect.innerHTML = '<option value="" disabled selected>एकं भागं चिनुत</option>';
    if (currentBookKey && allBooks[currentBookKey].sections) {
        for (const key in allBooks[currentBookKey].sections) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = allBooks[currentBookKey].sections[key].title;
            sectionSelect.appendChild(option);
        }
        document.getElementById('ocrSection').style.display = 'block';
        document.getElementById('viewMantraSection').style.display = 'block';
    } else {
        document.getElementById('ocrSection').style.display = 'none';
        document.getElementById('viewMantraSection').style.display = 'none';
    }
}

function renderMantraTabs() {
    mantraTabContainer.innerHTML = '';
    btnEditMantra.disabled = true;
    if (currentBookKey && currentSectionKey && allBooks[currentBookKey].sections[currentSectionKey].mantras) {
        const mantras = allBooks[currentBookKey].sections[currentSectionKey].mantras;
        const mantraKeys = Object.keys(mantras);
        if (mantraKeys.length > 0) {
            mantraKeys.forEach((key) => {
                const mantra = mantras[key];
                const tabButton = document.createElement('button');
                tabButton.className = 'tab-button';
                tabButton.setAttribute('data-key', key);
                tabButton.textContent = mantra.title;
                tabButton.addEventListener('click', () => {
                    loadMantra(key);
                });
                mantraTabContainer.appendChild(tabButton);
            });

            if (currentMantraKey && mantras[currentMantraKey]) {
                loadMantra(currentMantraKey);
            } else {
                loadMantra(mantraKeys[0]);
            }
        } else {
            mantraTitleDisplay.innerHTML = '<h3>न पाठः</h3>';
            mantraDescriptionDisplay.innerHTML = '<p>अस्मिन् खण्डे कोऽपि पाठः नास्ति । नूतनं पाठं योजयन्तु।</p>';
            mantraContentDisplay.innerHTML = '';
        }
    } else {
        mantraTitleDisplay.innerHTML = '<h3>>न पाठः/h3>';
        mantraDescriptionDisplay.innerHTML = '<p>अस्मिन् खण्डे कोऽपि पाठः नास्ति । नूतनं पाठं योजयन्तु।</p>';
        mantraContentDisplay.innerHTML = '';
    }
}

function getGraphemeIndices(text, startIndex, endIndex) {
    const segmenter = new Intl.Segmenter('sa', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(text));
    let indices = [];
    let charIndex = 0;
    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i].segment;
        const segmentEndIndex = charIndex + seg.length;
        if (segmentEndIndex > startIndex && charIndex < endIndex) {
            indices.push(i);
        }
        charIndex = segmentEndIndex;
    }
    return indices;
}

function preparePitches(pitchType) {
    const fullText = ocrTextarea.value;
    const startIndex = ocrTextarea.selectionStart;
    const endIndex = ocrTextarea.selectionEnd;

    if (startIndex === endIndex) {
        alert("कृपया OCR आउटपुट् बॉक्स् मध्ये किञ्चित् पाठं चिनोतु ।");
        return;
    }

    const selectedGraphemeIndices = getGraphemeIndices(fullText, startIndex, endIndex);
    selectedGraphemeIndices.forEach(index => {
        pitchMarks[index] = pitchType;
    });
    updateStatus(`पिचः चिह्निताः सन्ति। इदानीं भवन्तः पाठं रक्षितुं शक्नुवन्ति ।`, 'info');
}

function loadMantra(key) {
    const mantras = allBooks[currentBookKey].sections[currentSectionKey].mantras;
    const mantra = mantras[key];
    if (!mantra) return;

    currentMantraKey = key;
    mantraTitleDisplay.innerHTML = `<h3>${mantra.title}</h3>`;
    mantraDescriptionDisplay.innerHTML = `<p>${mantra.description}</p>`;

    let htmlContent = '';
    mantra.instructions.forEach(instruction => {
        instruction.mantra.forEach(line => {
            line.forEach(syllable => {
                const pitchClass = syllable.pitch ? `pitch-marked-char ${syllable.pitch}` : '';
                htmlContent += `<span class="${pitchClass}">${syllable.char}</span>`;
            });
            htmlContent += '<br>';
        });
    });
    mantraContentDisplay.innerHTML = htmlContent;

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    const selectedTab = document.querySelector(`.tab-button[data-key="${key}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        btnEditMantra.disabled = false;
    }
}

createNewBookBtn.addEventListener('click', () => {
    const title = newBookTitleInput.value.trim();
    if (!title) {
        alert("कृपया पुस्तकस्य नाम ददातु।");
        return;
    }
    const key = title.replace(/\s+/g, '');
    if (allBooks[key]) {
        alert(" नामयुक्तं पुस्तकं पूर्वमेव विद्यते । कृपया भिन्नं नाम चिनुत।");
        return;
    }
    allBooks[key] = { title: title, sections: {} };
    currentBookKey = key;
    saveBookData();
    renderBookSelect();
    renderSectionSelect();
    bookSelect.value = key;
    updateStatus(`पुस्तकस्य '${title}' निर्मितम् । अधुना भागं योजयन्तु ।.`, 'success');
});

bookSelect.addEventListener('change', (e) => {
    currentBookKey = e.target.value;
    currentSectionKey = null;
    renderSectionSelect();
    updateStatus(`पुस्तकस्य '${allBooks[currentBookKey].title}'चयनितम् । भागं चिनोतु अथवा नूतनं भागं रचयतु।`, 'info');
});

deleteBookBtn.addEventListener('click', () => {
    if (!currentBookKey) {
        alert("कृपया विलोपनार्थं पुस्तकं चिनोतु।");
        return;
    }
    if (confirm(`त्वम्‌ '${allBooks[currentBookKey].title}' किं भवन्तः पुस्तकं विलोपयितुम् इच्छन्ति इति निश्चितम्?`)) {
        delete allBooks[currentBookKey];
        currentBookKey = null;
        currentSectionKey = null;
        saveBookData();
        renderBookSelect();
        renderSectionSelect();
        updateStatus("पुस्तकं सफलतया विलोपितम्।", 'success');
    }
});

addNewSectionBtn.addEventListener('click', () => {
    if (!currentBookKey) {
        alert("प्रथमं पुस्तकं चिनोतु वा रचयतु वा।");
        return;
    }
    const title = newSectionTitleInput.value.trim();
    if (!title) {
        alert("कृपया भागस्य नामकरणं कुर्वन्तु।");
        return;
    }
    const key = title.replace(/\s+/g, '');
    if (allBooks[currentBookKey].sections[key]) {
        alert("अनेन नाम्ना घटकः पूर्वमेव विद्यते । कृपया भिन्नं नाम चिनुत।.");
        return;
    }
    allBooks[currentBookKey].sections[key] = { title: title, mantras: {} };
    currentSectionKey = key;
    saveBookData();
    renderSectionSelect();
    renderMantraTabs();
    sectionSelect.value = key;
    updateStatus(`'${title}' भागः निर्मितः अस्ति। अधुना OCR आरभ्यताम् ।`, 'success');
});

sectionSelect.addEventListener('change', (e) => {
    currentSectionKey = e.target.value;
    renderMantraTabs();
    updateStatus(`'${allBooks[currentBookKey].sections[currentSectionKey].title}' भागः चयनितः। मन्त्रं योजयितुं सज्जाः।.`, 'info');
});

deleteSectionBtn.addEventListener('click', () => {
    if (!currentBookKey || !currentSectionKey) {
        alert("कृपया विलोपनार्थं भागं चिनोतु।");
        return;
    }
    if (confirm(`त्वम्‌ '${allBooks[currentBookKey].sections[currentSectionKey].title}'किं भवन्तः निश्चितरूपेण भागं विलोपयितुम् इच्छन्ति?`)) {
        delete allBooks[currentBookKey].sections[currentSectionKey];
        currentSectionKey = null;
        saveBookData();
        renderSectionSelect();
        renderMantraTabs();
        updateStatus("घटकः सफलतया विलोपितः.", 'success');
    }
});

imageInput.addEventListener('change', () => {
    if (imageInput.files.length === 0) return;
    const file = imageInput.files[0];
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    updateStatus("चित्रं लोड् भवति। 'Start OCR' इत्यत्र क्लिक् कुर्वन्तु ।", 'info');
    btnOcr.disabled = false;
    ocrTextarea.value = "";
    pitchMarks = [];
});

btnOcr.addEventListener('click', async () => {
    if (!imageInput.files[0] || !worker) return;
    btnOcr.disabled = true;
    ocrSpinner.style.display = 'inline-block';
    updateStatus("ओसीआर करोति...", 'info');
    try {
        const { data } = await worker.recognize(imageInput.files[0], 'san');

        // Fixed regex without invalid range for Sanskrit Unicode characters
        const sanitizedText = data.text.replace(/[^ऀ-ःअ-हऽ़ॠ-ॣ०-९\s\n]/g, '').trim();

        ocrTextarea.value = sanitizedText;

        const segmenter = new Intl.Segmenter('sa', { granularity: 'grapheme' });
        const segments = Array.from(segmenter.segment(sanitizedText));
        pitchMarks = Array(segments.length).fill('none');

        updateStatus("ओसीआर सम्पूर्णम् अस्ति। पाठं चित्वा पिच् बटन् नुदन्तु ।", 'success');
    } catch (error) {
        updateStatus("ओसीआर-काले त्रुटिः अभवत् । कृपया भिन्नं चित्रं प्रयतस्व।", 'error');
        console.error("ओसीआर त्रुटिः : १.", error);
    } finally {
        btnOcr.disabled = false;
        ocrSpinner.style.display = 'none';
    }
});


btnClear.addEventListener('click', () => {
    ocrTextarea.value = '';
    imageInput.value = '';
    preview.style.display = 'none';
    btnOcr.disabled = true;
    pitchMarks = [];
    mantraTitleInput.value = '';
    mantraDescriptionInput.value = '';
    currentMantraKey = null;
    updateStatus('सर्वाणि OCR सामग्रीः निष्कासिता अस्ति। चित्रं अपलोड् कृत्वा पुनः आरभत।', 'info');
    btnSaveMantra.textContent = 'नवीन पाठ  रक्षे ✨' ;
});

btnSaveMantra.addEventListener('click', () => {
    if (!currentBookKey || !currentSectionKey) {
        alert("प्रथमं पुस्तकं, एकं अंशं च चिनुत।");
        return;
    }
    const title = mantraTitleInput.value.trim();
    const description = mantraDescriptionInput.value.trim();
    const fullText = ocrTextarea.value;

    if (!title) {
        alert('कृपया अद्वितीय नाम दिया।');
        return;
    }
    const newKey = title.replace(/\s+/g, '');
    if (newKey !== currentMantraKey && allBooks[currentBookKey].sections[currentSectionKey].mantras[newKey]) {
        alert(`'${title}' नामयुक्तः पाठः पूर्वमेव अस्ति । कृपया एकं अद्वितीयं नाम चिनुत।`);
        return;
    }
    if (fullText.trim().length === 0) {
        alert('OCR आउटपुट् रिक्तम् अस्ति । कृपया OCR कुर्वन्तु ततः रक्षन्तु।');
        return;
    }

    const segmenter = new Intl.Segmenter('sa', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(fullText));
    let mantraInstructions = [];
    let currentLine = [];
    segments.forEach((seg, index) => {
        const char = seg.segment;
        const pitch = pitchMarks[index];
        if (char.includes('\n')) {
            if (currentLine.length > 0) {
                mantraInstructions.push({ mantra: [currentLine] });
                currentLine = [];
            }
            return;
        }
        let syllable = { char: char };
        if (pitch && pitch !== 'none') {
            syllable.pitch = pitch;
        }
        currentLine.push(syllable);
    });
    if (currentLine.length > 0) {
        mantraInstructions.push({ mantra: [currentLine] });
    }

    const newMantra = {
        title: title,
        description: description,
        instructions: mantraInstructions
    };

    const keyToUse = currentMantraKey || newKey;
    allBooks[currentBookKey].sections[currentSectionKey].mantras[keyToUse] = newMantra;

    saveBookData();
    renderMantraTabs();
    loadMantra(keyToUse);
    mantraTitleInput.value = '';
    mantraDescriptionInput.value = '';
    ocrTextarea.value = '';
    pitchMarks = [];
    currentMantraKey = null;
    updateStatus(`'${title}' पाठः सफलतया रक्षितः।.`, 'success');
    btnSaveMantra.textContent = 'नव पाठः रक्षतु ✨';
});

btnEditMantra.addEventListener('click', () => {
    if (!currentMantraKey) {
        alert("कृपया सम्पादनार्थं पाठः चिनोतु।");
        return;
    }
    const mantra = allBooks[currentBookKey].sections[currentSectionKey].mantras[currentMantraKey];
    mantraTitleInput.value = mantra.title;
    mantraDescriptionInput.value = mantra.description;

    let fullText = '';
    let tempPitchMarks = [];

    mantra.instructions.forEach(instruction => {
        instruction.mantra.forEach(line => {
            line.forEach(syllable => {
                fullText += syllable.char;
                tempPitchMarks.push(syllable.pitch || 'none');
            });
            fullText += '\n';
            tempPitchMarks.push('none');
        });
    });

    fullText = fullText.trim();
    tempPitchMarks = tempPitchMarks.slice(0, tempPitchMarks.length - 1);

    ocrTextarea.value = fullText;
    pitchMarks = tempPitchMarks;

    updateStatus("पाठस्य सम्पादनार्थं सज्जाः।", 'info');
    btnSaveMantra.textContent = 'पाठः अद्यतनं कुर्वन्तु✏️';
});

btnDownloadMantra.addEventListener('click', downloadBook);

helperToggleBtn.addEventListener('click', () => {
    const isVisible = helperContent.style.display === 'block';
    helperContent.style.display = isVisible ? 'none' : 'block';
    helperArrow.textContent = isVisible ? '▼' : '▲';
});

renderBookSelect();
renderSectionSelect();
renderMantraTabs();

async function downloadBook() {
    if (!currentBookKey) {
        alert("कृपया डाउनलोड् कर्तुं पुस्तकं चिनुत।");
        return;
    }

    const book = allBooks[currentBookKey];
    const creationDate = new Date().toLocaleString('te-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });

    const sectionsCount = Object.keys(book.sections).length;
    const totalPages = sectionsCount + 1; // +1 for cover page

    let htmlContent = `
    <!DOCTYPE html>
    <html lang="sa" xml:lang="sa">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="keywords" content="${book.title}, संस्कृत, मन्त्र, भारतीय संस्कृति, अध्यात्म"। />
        <title>${book.title} - संस्कृत पुस्तक</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Noto Sans Devanagari', serif;
                background-color: #f0f4f8;
                color: #2d3748;
                padding: 2rem;
                margin: 0;
            }
            h1 {
                color: #4c51bf;
                text-align: center;
                margin-bottom: 0.2em;
            }
            .pages-info {
                text-align: center;
                color: #555;
                margin-top: 0;
                font-weight: 600;
                font-size: 1rem;
            }
            .section {
                background-color: white;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                position: relative;
                min-height: 8rem;
            }
            .pitch-display {
                font-size: 1.25rem;
                line-height: 2.2;
                white-space: pre-wrap;
                word-wrap: break-word;
                text-align: justify;
            }
            .pitch-marked-char {
                position: relative;
                display: inline-flex;
                flex-direction: column;
                align-items: center;
                line-height: 1.5;
                text-align: center;
                padding: 0.4em 0.2em;
            }
            .pitch-marked-char.high::before {
                content: "▲";
                position: absolute;
                top: -0.7em;
                left: 50%;
                transform: translateX(-50%);
                color: #1f3674;
                font-size: 0.8em;
                margin-top: 0.2em;
            }
            .pitch-marked-char.low::after {
                content: "▼";
                position: absolute;
                bottom: -0.5em;
                left: 50%;
                transform: translateX(-50%);
                color: #a08b5e;
                font-size: 0.8em;
            }
            .pitch-marked-char.svarita::before {
                content: "⌒";
                position: absolute;
                top: -0.7em;
                left: 50%;
                transform: translateX(-50%);
                color: #c0392b;
                font-size: 0.8em;
                margin-top: 0.2em;
            }
            .pitch-marked-char.dirgha-svarita::before {
                content: "〰";
                position: absolute;
                top: -0.7em;
                left: 50%;
                transform: translateX(-50%);
                color: #27ae60;
                font-size: 0.8em;
                margin-top: 0.2em;
            }
            footer.page-footer {
                position: absolute;
                bottom: 0.75rem;
                right: 1rem;
                font-size: 0.875rem;
                color: #777;
                font-family: sans-serif;
            }
        </style>
    </head>
    <body>
        <h1>${book.title}</h1>
        <p class="pages-info">कुलपृष्ठानि (भागाः + आवरणम्) : १. ${totalPages}</p>
    `;

    let pageIndex = 2; 
    for (const sectionKey in book.sections) {
        const section = book.sections[sectionKey];
        htmlContent += `<div class="section" aria-label="पाठ इति ${pageIndex} - ${section.title}">`;
        htmlContent += `<h2>${section.title}</h2>`;
        for (const mantraKey in section.mantras) {
            const mantra = section.mantras[mantraKey];
            htmlContent += `<h3>${mantra.title}</h3><p>${mantra.description}</p><div class="pitch-display">`;
            mantra.instructions.forEach(instruction => {
                instruction.mantra.forEach(line => {
                    line.forEach(syllable => {
                        const pitchClass = syllable.pitch ? `pitch-marked-char ${syllable.pitch}` : '';
                        htmlContent += `<span class="${pitchClass}">${syllable.char}</span>`;
                    });
                    htmlContent += '<br>';
                });
            });
            htmlContent += `</div>`;
        }
        htmlContent += `<footer class="page-footer">Page ${pageIndex} पृष्ठ - कुल ${totalPages} पृष्ठहरू</footer>`;
        htmlContent += `</div>`;
        pageIndex++;
    }

    htmlContent += `
    <footer style="text-align: center; padding: 20px; font-family: sans-serif; border-top: 1px solid #e0e0e0; margin-top: 20px; color: #777; font-size: 14px;">
        <p>
            निर्मितः : १. ${creationDate}<br>
           अक्षरधारा सॉफ्टवेयर<br>
            कथं तस्य परिकल्पना भवति : १.<br>
            1. चित्रं OCRed अस्ति, ., 2. अङ्कीयपुस्तकरूपेण डाउनलोड् कृतम्।
        </p>
    </footer>
    </body></html>
    `;

    const filename = `${book.title}.html`;
    await downloadHtmlFile(filename, htmlContent);
}

function downloadHtmlFile(filename, content) {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}
