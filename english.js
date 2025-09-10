document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.getElementById('hamburger-icon');
    const navLinks = document.getElementById('nav-links');

    // Toggle mobile menu open/close
    hamburger.addEventListener('click', function () {
        const expanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !expanded);
        navLinks.classList.toggle('active');
    });

    // Find all dropdown containers and their toggle anchors
    const dropdownContainers = document.querySelectorAll('.dropdown');

    dropdownContainers.forEach(dropdown => {
        const toggleLink = dropdown.querySelector('a.nav-link');

        toggleLink.addEventListener('click', function (e) {
            // On small screens only toggle submenu on click
            if (window.innerWidth <= 768) {
                e.preventDefault();
                const expanded = dropdown.getAttribute('aria-expanded') === 'true';
                dropdown.setAttribute('aria-expanded', !expanded);
                dropdown.classList.toggle('open');
            }
        });
    });
});

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
        updateStatus("Error saving data. Please check your browser settings.", 'error');
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
    updateStatus("Initializing OCR engine...", 'info');
    loadBookData();
    renderBookSelect();
    try {
        worker = await Tesseract.createWorker({
            langPath: "https://tessdata.projectnaptha.com/4.0.0",
            logger: m => {
                if (m.status === "recognizing text") {
                    updateStatus(`Recognizing text: ${(m.progress * 100).toFixed(2)}%`, 'info');
                }
            }
        });
        await worker.loadLanguage("eng");
        await worker.initialize("eng");
        updateStatus("OCR engine ready. Create or select a book.", 'success');
    } catch (error) {
        console.error("OCR initialization error:", error);
        updateStatus("Failed to initialize OCR engine. Please check your network connection.", 'error');
    }
}
window.onload = initWorker;

function renderBookSelect() {
    bookSelect.innerHTML = '<option value="" disabled selected>Select a book</option>';
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
    sectionSelect.innerHTML = '<option value="" disabled selected>Select a section</option>';
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
                // Load the first mantra by default
                loadMantra(mantraKeys[0]);
            }
        } else {
            mantraTitleDisplay.innerHTML = '<h3>No Text</h3>';
            mantraDescriptionDisplay.innerHTML = '<p>No text in this section. Please add new text.</p>';
            mantraContentDisplay.innerHTML = '';
        }
    } else {
        mantraTitleDisplay.innerHTML = '<h3>No Text</h3>';
        mantraDescriptionDisplay.innerHTML = '<p>No text in this section. Please add new text.</p>';
        mantraContentDisplay.innerHTML = '';
    }
}

function getGraphemeIndices(text, startIndex, endIndex) {
    const segmenter = new Intl.Segmenter('te', { granularity: 'grapheme' });
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
        alert("Please select some text in OCR output box.");
        return;
    }

    const selectedGraphemeIndices = getGraphemeIndices(fullText, startIndex, endIndex);
    selectedGraphemeIndices.forEach(index => {
        pitchMarks[index] = pitchType;
    });
    updateStatus(`Pitches assigned. You can now save the text.`, 'info');
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

// Event Listeners for New Functionality
createNewBookBtn.addEventListener('click', () => {
    const title = newBookTitleInput.value.trim();
    if (!title) {
        alert("Please enter a book name.");
        return;
    }
    const key = title.replace(/\s+/g, '');
    if (allBooks[key]) {
        alert("A book with this name already exists. Please choose another name.");
        return;
    }
    allBooks[key] = { title: title, sections: {} };
    currentBookKey = key;
    saveBookData();
    renderBookSelect();
    renderSectionSelect();
    bookSelect.value = key;
    updateStatus(`Book '${title}' created. Now add a section.`, 'success');
});

bookSelect.addEventListener('change', (e) => {
    currentBookKey = e.target.value;
    currentSectionKey = null;
    renderSectionSelect();
    updateStatus(`Book '${allBooks[currentBookKey].title}' selected. Choose or create a section.`, 'info');
});

deleteBookBtn.addEventListener('click', () => {
    if (!currentBookKey) {
        alert("Please select a book to delete.");
        return;
    }
    if (confirm(`Are you sure you want to delete '${allBooks[currentBookKey].title}'?`)) {
        delete allBooks[currentBookKey];
        currentBookKey = null;
        currentSectionKey = null;
        saveBookData();
        renderBookSelect();
        renderSectionSelect();
        updateStatus("Book successfully deleted.", 'success');
    }
});

addNewSectionBtn.addEventListener('click', () => {
    if (!currentBookKey) {
        alert("Please select or create a book first.");
        return;
    }
    const title = newSectionTitleInput.value.trim();
    if (!title) {
        alert("Please enter a section name.");
        return;
    }
    const key = title.replace(/\s+/g, '');
    if (allBooks[currentBookKey].sections[key]) {
        alert("A section with this name already exists. Please choose another name.");
        return;
    }
    allBooks[currentBookKey].sections[key] = { title: title, mantras: {} };
    currentSectionKey = key;
    saveBookData();
    renderSectionSelect();
    renderMantraTabs();
    sectionSelect.value = key;
    updateStatus(`Section '${title}' created. Now start OCR.`, 'success');
});

sectionSelect.addEventListener('change', (e) => {
    currentSectionKey = e.target.value;
    renderMantraTabs();
    updateStatus(`Section '${allBooks[currentBookKey].sections[currentSectionKey].title}' selected. Ready to add mantras.`, 'info');
});

deleteSectionBtn.addEventListener('click', () => {
    if (!currentBookKey || !currentSectionKey) {
        alert("Please select a section to delete.");
        return;
    }
    if (confirm(`Are you sure you want to delete section '${allBooks[currentBookKey].sections[currentSectionKey].title}'?`)) {
        delete allBooks[currentBookKey].sections[currentSectionKey];
        currentSectionKey = null;
        saveBookData();
        renderSectionSelect();
        renderMantraTabs();
        updateStatus("Section successfully deleted.", 'success');
    }
});

// Existing Event Listeners
imageInput.addEventListener('change', () => {
    if (imageInput.files.length === 0) return;
    const file = imageInput.files[0];
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
    updateStatus("Image loaded. Click 'Start OCR'.", 'info');
    btnOcr.disabled = false;
    ocrTextarea.value = "";
    pitchMarks = [];
});

btnOcr.addEventListener('click', async () => {
    if (!imageInput.files[0] || !worker) return;
    btnOcr.disabled = true;
    ocrSpinner.style.display = 'inline-block';
    updateStatus("Performing OCR...", 'info');
    try {
        const { data } = await worker.recognize(imageInput.files[0], 'eng');
        const sanitizedText = data.text.replace(/[\u030D\u0323]/g, '').trim();
        ocrTextarea.value = sanitizedText;
        const segmenter = new Intl.Segmenter('te', { granularity: 'grapheme' });
        const segments = Array.from(segmenter.segment(sanitizedText));
        pitchMarks = Array(segments.length).fill('none');
        updateStatus("OCR complete. Select text and click pitch buttons.", 'success');
    } catch (error) {
        updateStatus("Error during OCR. Please try another image.", 'error');
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
    updateStatus('All OCR content cleared. Upload image and restart.', 'info');
    btnSaveMantra.textContent = 'Save New Text ✨';
});

btnSaveMantra.addEventListener('click', () => {
    if (!currentBookKey || !currentSectionKey) {
        alert("Please select a book and section first.");
        return;
    }
    const title = mantraTitleInput.value.trim();
    const description = mantraDescriptionInput.value.trim();
    const fullText = ocrTextarea.value;

    if (!title) {
        alert('Please provide a unique title.');
        return;
    }
    const newKey = title.replace(/\s+/g, '');
    if (newKey !== currentMantraKey && allBooks[currentBookKey].sections[currentSectionKey].mantras[newKey]) {
        alert(`A text with title '${title}' already exists. Please choose a unique title.`);
        return;
    }
    if (fullText.trim().length === 0) {
        alert('OCR output is empty. Please perform OCR and then save.');
        return;
    }

    const segmenter = new Intl.Segmenter('te', { granularity: 'grapheme' });
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
    updateStatus(`'${title}' text saved successfully.`, 'success');
    btnSaveMantra.textContent = 'Save New Text ✨';
});

btnEditMantra.addEventListener('click', () => {
    if (!currentMantraKey) {
        alert("Please select a mantra to edit.");
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
            tempPitchMarks.push('none'); // Marker for new line
        });
    });

    fullText = fullText.trim();
    tempPitchMarks = tempPitchMarks.slice(0, tempPitchMarks.length - 1);

    ocrTextarea.value = fullText;
    pitchMarks = tempPitchMarks;

    updateStatus("Ready to edit mantra.", 'info');
    btnSaveMantra.textContent = 'Update Text ✏️';
});

btnDownloadMantra.addEventListener('click', downloadBook);

helperToggleBtn.addEventListener('click', () => {
    const isVisible = helperContent.style.display === 'block';
    helperContent.style.display = isVisible ? 'none' : 'block';
    helperArrow.textContent = isVisible ? '▼' : '▲';
});

// Initial render on page load
renderBookSelect();
renderSectionSelect();
renderMantraTabs();

async function downloadBook() {
    if (!currentBookKey) {
        alert("Please select a book to download.");
        return;
    }

    const book = allBooks[currentBookKey];
    const creationDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });

    const sectionsCount = Object.keys(book.sections).length;
    const totalPages = sectionsCount + 1; // +1 for cover page

    // Build cover page content with total pages info
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Add keywords metadata for EPUB search support -->
        <meta name="keywords" content="${book.title}, Telugu Poetry, Mantras, Indian Culture, Spirituality" />
        <title>${book.title} - Telugu Poetry</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;700&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Noto Sans Telugu', serif;
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
        <p class="pages-info">Total pages (sections + cover): ${totalPages}</p>
    `;

    // Build each section with footer showing page number x of y
    let pageIndex = 2; // because 1 is cover
    for (const sectionKey in book.sections) {
        const section = book.sections[sectionKey];
        htmlContent += `<div class="section" aria-label="Section ${pageIndex} - ${section.title}">`;
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
        // Footer with page number
        htmlContent += `<footer class="page-footer">Page ${pageIndex} - Total ${totalPages} pages</footer>`;
        htmlContent += `</div>`;
        pageIndex++;
    }

    // Add overall footer with creation info
    htmlContent += `
    <footer style="text-align: center; padding: 20px; font-family: sans-serif; border-top: 1px solid #e0e0e0; margin-top: 20px; color: #777; font-size: 14px;">
        <p>
            Created on: ${creationDate}<br>
            Created by: Aksharadhara Software<br>
            Created with:<br>
            1. Image OCR, 2. Downloaded as digital book.
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
    document.body.appendChild(a);  // For Firefox compatibility
    a.click();

    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
}
