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
        localStorage.setItem('aksharadharaBooks', JSON.stringify(allBooks));
    } catch (e) {
        console.error("Failed to save data to local storage:", e);
        updateStatus("डेटा सहेजने में त्रुटि हुई। कृपया अपने ब्राउज़र की सेटिंग देखें।", 'error');
    }
}

function loadBookData() {
    try {
        const savedData = localStorage.getItem('aksharadharaBooks');
        if (savedData) {
            allBooks = JSON.parse(savedData);
        }
    } catch (e) {
        console.error("Failed to load data from local storage:", e);
    }
}

async function initWorker() {
    updateStatus("OCR इंजन शुरू हो रहा है...", 'info');
    loadBookData();
    renderBookSelect();
    try {
        worker = await Tesseract.createWorker({
            langPath: "https://tessdata.projectnaptha.com/4.0.0",
            logger: m => {
                if (m.status === "recognizing text") {
                    updateStatus(`टेक्स्ट पहचान रहा है: ${(m.progress * 100).toFixed(2)}%`, 'info');
                }
            }
        });
        await worker.loadLanguage("hin");
        await worker.initialize("hin");
        updateStatus("OCR इंजन तैयार है। एक नई पुस्तक बनाएं या चुनें।", 'success');
    } catch (error) {
        console.error("OCR initialization error:", error);
        updateStatus("OCR इंजन शुरू करने में विफल रहा। कृपया अपना नेटवर्क कनेक्शन जांचें।", 'error');
    }
}
window.onload = initWorker;

function renderBookSelect() {
    bookSelect.innerHTML = '<option value="" disabled selected>एक पुस्तक चुनें</option>';
    if (Object.keys(allBooks).length > 0) {
        for (const key in allBooks) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = allBooks[key].title;
            bookSelect.appendChild(option);
        }
        sectionCreationSection.style.display = 'block';
    } else {
        sectionCreationSection.style.display = 'none';
    }
}

function renderSectionSelect() {
    sectionSelect.innerHTML = '<option value="" disabled selected>एक अनुभाग चुनें</option>';
    if (currentBookKey && allBooks[currentBookKey].sections) {
        for (const key in allBooks[currentBookKey].sections) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = allBooks[currentBookKey].sections[key].title;
            sectionSelect.appendChild(option);
        }
        ocrSection.style.display = 'block';
        viewMantraSection.style.display = 'block';
    } else {
        ocrSection.style.display = 'none';
        viewMantraSection.style.display = 'none';
    }
}

function renderMantraTabs() {
    mantraTabContainer.innerHTML = '';
    btnEditMantra.disabled = true;
    if (currentBookKey && currentSectionKey) {
        const mantras = allBooks[currentBookKey].sections[currentSectionKey].mantras;
        if (mantras) {
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
                mantraTitleDisplay.innerHTML = '<h3>कोई पाठ्य नहीं</h3>';
                mantraDescriptionDisplay.innerHTML = '<p>इस अनुभाग में कोई पाठ्य नहीं है। कृपया नया पाठ्य जोड़ें।</p>';
                mantraContentDisplay.innerHTML = '';
            }
        }
    } else {
        mantraTitleDisplay.innerHTML = '<h3>कोई पाठ्य नहीं</h3>';
        mantraDescriptionDisplay.innerHTML = '<p>इस अनुभाग में कोई पाठ्य नहीं है। कृपया नया पाठ्य जोड़ें।</p>';
        mantraContentDisplay.innerHTML = '';
    }
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
                htmlContent += syllable.char;
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

// Event Listeners
createNewBookBtn.addEventListener('click', () => {
    const title = newBookTitleInput.value.trim();
    if (!title) {
        alert("कृपया पुस्तक का नाम दर्ज करें।");
        return;
    }
    const key = title.replace(/\s+/g, '');
    if (allBooks[key]) {
        alert("इस नाम की एक पुस्तक पहले से मौजूद है। कृपया कोई और नाम चुनें।");
        return;
    }
    allBooks[key] = { title: title, sections: {} };
    currentBookKey = key;
    saveBookData();
    renderBookSelect();
    renderSectionSelect();
    bookSelect.value = key;
    updateStatus(`पुस्तक '${title}' बनाई गई। अब एक अनुभाग जोड़ें।`, 'success');
});

bookSelect.addEventListener('change', (e) => {
    currentBookKey = e.target.value;
    currentSectionKey = null;
    renderSectionSelect();
    updateStatus(`पुस्तक '${allBooks[currentBookKey].title}' चुनी गई। एक अनुभाग चुनें या बनाएं।`, 'info');
});

deleteBookBtn.addEventListener('click', () => {
    if (!currentBookKey) {
        alert("कृपया हटाने के लिए एक पुस्तक चुनें।");
        return;
    }
    if (confirm(`क्या आप वाकई '${allBooks[currentBookKey].title}' को हटाना चाहते हैं?`)) {
        delete allBooks[currentBookKey];
        currentBookKey = null;
        currentSectionKey = null;
        saveBookData();
        renderBookSelect();
        renderSectionSelect();
        updateStatus("पुस्तक सफलतापूर्वक हटाई गई।", 'success');
    }
});

addNewSectionBtn.addEventListener('click', () => {
    if (!currentBookKey) {
        alert("कृपया पहले एक पुस्तक चुनें या बनाएं।");
        return;
    }
    const title = newSectionTitleInput.value.trim();
    if (!title) {
        alert("कृपया अनुभाग का नाम दर्ज करें।");
        return;
    }
    const key = title.replace(/\s+/g, '');
    if (allBooks[currentBookKey].sections[key]) {
        alert("इस नाम का एक अनुभाग पहले से मौजूद है। कृपया कोई और नाम चुनें।");
        return;
    }
    allBooks[currentBookKey].sections[key] = { title: title, mantras: {} };
    currentSectionKey = key;
    saveBookData();
    renderSectionSelect();
    renderMantraTabs();
    sectionSelect.value = key;
    updateStatus(`अनुभाग '${title}' बनाया गया। अब OCR शुरू करें।`, 'success');
});

sectionSelect.addEventListener('change', (e) => {
    currentSectionKey = e.target.value;
    renderMantraTabs();
    updateStatus(`अनुभाग '${allBooks[currentBookKey].sections[currentSectionKey].title}' चुना गया। मंत्र जोड़ने के लिए तैयार।`, 'info');
});

deleteSectionBtn.addEventListener('click', () => {
    if (!currentBookKey || !currentSectionKey) {
        alert("कृपया हटाने के लिए एक अनुभाग चुनें।");
        return;
    }
    if (confirm(`क्या आप वाकई अनुभाग '${allBooks[currentBookKey].sections[currentSectionKey].title}' को हटाना चाहते हैं?`)) {
        delete allBooks[currentBookKey].sections[currentSectionKey];
        currentSectionKey = null;
        saveBookData();
        renderSectionSelect();
        renderMantraTabs();
        updateStatus("अनुभाग सफलतापूर्वक हटाया गया।", 'success');
    }
});

imageInput.addEventListener('change', () => {
    if (imageInput.files.length === 0) return;
    const file = imageInput.files[0];
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    updateStatus("छवि लोड हो गई है। 'OCR शुरू करें' पर क्लिक करें।", 'info');
    btnOcr.disabled = false;
    ocrTextarea.value = "";
    pitchMarks = [];
});

btnOcr.addEventListener('click', async () => {
    if (!imageInput.files[0] || !worker) return;
    btnOcr.disabled = true;
    ocrSpinner.style.display = 'inline-block';
    updateStatus("OCR चल रहा है...", 'info');
    try {
        const { data } = await worker.recognize(imageInput.files[0], 'hin');
        const sanitizedText = data.text.replace(/[\u030D\u0323]/g, '').trim();
        ocrTextarea.value = sanitizedText;
        const segmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });
        const segments = Array.from(segmenter.segment(sanitizedText));
        pitchMarks = Array(segments.length).fill('none');
        updateStatus("OCR पूरा हुआ। टेक्स्ट चुनें।", 'success');
    } catch (error) {
        updateStatus("OCR के दौरान त्रुटि। कृपया कोई और छवि आज़माएं।", 'error');
        console.error("OCR error:", error);
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
    updateStatus('सभी OCR सामग्री हटा दी गई है। छवि अपलोड करें और पुनः आरंभ करें।', 'info');
    btnSaveMantra.textContent = 'नया पाठ्य सेव करें ✨';
});

btnSaveMantra.addEventListener('click', () => {
    if (!currentBookKey || !currentSectionKey) {
        alert("कृपया पहले एक पुस्तक और अनुभाग चुनें।");
        return;
    }
    const title = mantraTitleInput.value.trim();
    const description = mantraDescriptionInput.value.trim();
    const fullText = ocrTextarea.value;

    if (!title) {
        alert('कृपया एक अद्वितीय शीर्षक प्रदान करें।');
        return;
    }
    const newKey = title.replace(/\s+/g, '');
    if (newKey !== currentMantraKey && allBooks[currentBookKey].sections[currentSectionKey].mantras[newKey]) {
        alert(`शीर्षक '${title}' वाला एक पाठ्य पहले से मौजूद है। कृपया एक अद्वितीय शीर्षक चुनें।`);
        return;
    }
    if (fullText.trim().length === 0) {
        alert('OCR आउटपुट खाली है। कृपया OCR करें और फिर सहेजें।');
        return;
    }

    const segmenter = new Intl.Segmenter('hi', { granularity: 'grapheme' });
    const segments = Array.from(segmenter.segment(fullText));
    let mantraInstructions = [];
    let currentLine = [];
    segments.forEach((seg) => {
        const char = seg.segment;
        const pitch = pitchMarks.shift() || 'none';
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
    updateStatus(`'${title}' पाठ्य सफलतापूर्वक सहेजा गया।`, 'success');
    btnSaveMantra.textContent = 'नया पाठ्य सेव करें ✨';
});

btnEditMantra.addEventListener('click', () => {
    if (!currentMantraKey) {
        alert("कृपया संपादन के लिए एक मंत्र चुनें।");
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
            tempPitchMarks.push('none'); // New line marker
        });
    });

    fullText = fullText.trim();
    tempPitchMarks = tempPitchMarks.slice(0, tempPitchMarks.length - 1);

    ocrTextarea.value = fullText;
    pitchMarks = tempPitchMarks;

    updateStatus("मंत्र संपादन के लिए तैयार है।", 'info');
    btnSaveMantra.textContent = 'पाठ्य अपडेट करें ✏️';
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
        alert("कृपया डाउनलोड करने के लिए एक पुस्तक चुनें।");
        return;
    }

    const book = allBooks[currentBookKey];
    const creationDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });

    const sectionsCount = Object.keys(book.sections).length;
    const totalPages = sectionsCount + 1;

    let htmlContent = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="${book.title}, Hindi Poetry, Mantras, Indian Culture, Spirituality" />
        <title>${book.title} - Hindi Poetry</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>
            body {
                font-family: 'Noto Sans Devanagari', sans-serif;
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
                min-height: 8rem;
            }
            footer.page-footer {
                font-size: 0.875rem;
                color: #777;
                font-family: sans-serif;
                text-align: right;
                margin-top: 1rem;
            }
            footer.overall-footer {
                text-align: center;
                padding: 20px;
                font-family: sans-serif;
                border-top: 1px solid #e0e0e0;
                margin-top: 20px;
                color: #777;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <h1>${book.title}</h1>
        <p class="pages-info">कुल पृष्ठ (अनुभाग + कवर): ${totalPages}</p>
    `;

    let pageIndex = 2;
    for (const sectionKey in book.sections) {
        const section = book.sections[sectionKey];
        htmlContent += `<div class="section" aria-label="अनुभाग ${pageIndex} - ${section.title}">`;
        htmlContent += `<h2>${section.title}</h2>`;
        for (const mantraKey in section.mantras) {
            const mantra = section.mantras[mantraKey];
            htmlContent += `<h3>${mantra.title}</h3><p>${mantra.description}</p><div>`;
            mantra.instructions.forEach(instruction => {
                instruction.mantra.forEach(line => {
                    let lineText = line.map(syl => syl.char).join('');
                    htmlContent += `<p>${lineText}</p>`;
                });
            });
            htmlContent += `</div>`;
        }
        htmlContent += `<footer class="page-footer">पृष्ठ ${pageIndex} of ${totalPages}</footer>`;
        htmlContent += `</div>`;
        pageIndex++;
    }

    htmlContent += `
    <footer class="overall-footer">
        <p>बनाने की तारीख: ${creationDate}</p>
        <p>द्वारा बनाया गया: अक्षरधारा सॉफ्टवेयर</p>
        <p>किससे बनाया गया: छवि OCR, डिजिटल पुस्तक के रूप में डाउनलोड किया गया</p>
    </footer>
    </body>
    </html>
    `;

    const filename = `${book.title.replace(/\s+/g, '_')}.html`;
    downloadHtmlFile(filename, htmlContent);
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