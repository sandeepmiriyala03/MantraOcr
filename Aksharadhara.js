// code for js 
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
                updateStatus("డేటా సేవ్ చేయడంలో లోపం. దయచేసి బ్రౌజర్ సెట్టింగ్‌లను తనిఖీ చేయండి.", 'error');
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
            updateStatus("OCR ఇంజిన్‌ను ప్రారంభించడం...", 'info');
            loadBookData();
            renderBookSelect();
            try {
                worker = await Tesseract.createWorker({
                    langPath: "https://tessdata.projectnaptha.com/4.0.0",
                    logger: m => {
                        if (m.status === "recognizing text") {
                            updateStatus(`వచనాన్ని గుర్తించడం: ${(m.progress * 100).toFixed(2)}%`, 'info');
                        }
                    }
                });
                await worker.loadLanguage("tel");
                await worker.initialize("tel");
                updateStatus("OCR ఇంజిన్ సిద్ధంగా ఉంది. పుస్తకాన్ని సృష్టించండి లేదా ఎంచుకోండి.", 'success');
            } catch (error) {
                console.error("OCR ప్రారంభ లోపం:", error);
                updateStatus("OCR ఇంజిన్‌ను ప్రారంభించడంలో విఫలమైంది. దయచేసి మీ నెట్‌వర్క్ కనెక్షన్‌ను తనిఖీ చేయండి.", 'error');
            }
        }
        window.onload = initWorker;

        function renderBookSelect() {
            bookSelect.innerHTML = '<option value="" disabled selected>ఒక పుస్తకాన్ని ఎంచుకోండి</option>';
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
            sectionSelect.innerHTML = '<option value="" disabled selected>ఒక భాగాన్ని ఎంచుకోండి</option>';
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
                    mantraKeys.forEach((key, index) => {
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
                    mantraTitleDisplay.innerHTML = '<h3>పాఠ్యము లేదు</h3>';
                    mantraDescriptionDisplay.innerHTML = '<p>ఈ భాగంలో పాఠ్యము లేదు. కొత్త పాఠ్యము జోడించండి.</p>';
                    mantraContentDisplay.innerHTML = '';
                }
            } else {
                mantraTitleDisplay.innerHTML = '<h3>పాఠ్యము లేదు</h3>';
                mantraDescriptionDisplay.innerHTML = '<p>ఈ భాగంలో పాఠ్యము లేదు. కొత్త పాఠ్యము జోడించండి.</p>';
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
                alert("దయచేసి OCR అవుట్‌పుట్ బాక్స్‌లో కొంత వచనాన్ని ఎంచుకోండి.");
                return;
            }

            const selectedGraphemeIndices = getGraphemeIndices(fullText, startIndex, endIndex);
            selectedGraphemeIndices.forEach(index => {
                pitchMarks[index] = pitchType;
            });
            updateStatus(`పిచ్‌లు గుర్తించబడ్డాయి. ఇప్పుడు మీరు పాఠ్యము సేవ్ చేయవచ్చు.`, 'info');
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
                alert("దయచేసి పుస్తకానికి పేరు ఇవ్వండి.");
                return;
            }
            const key = title.replace(/\s+/g, '');
            if (allBooks[key]) {
                alert("ఈ పేరుతో ఒక పుస్తకం ఇప్పటికే ఉంది. దయచేసి వేరే పేరు ఎంచుకోండి.");
                return;
            }
            allBooks[key] = { title: title, sections: {} };
            currentBookKey = key;
            saveBookData();
            renderBookSelect();
            renderSectionSelect();
            bookSelect.value = key;
            updateStatus(`పుస్తకం '${title}' సృష్టించబడింది. ఇప్పుడు భాగాన్ని జోడించండి.`, 'success');
        });

        bookSelect.addEventListener('change', (e) => {
            currentBookKey = e.target.value;
            currentSectionKey = null;
            renderSectionSelect();
            updateStatus(`పుస్తకం '${allBooks[currentBookKey].title}' ఎంపిక చేయబడింది. భాగాన్ని ఎంచుకోండి లేదా కొత్త భాగాన్ని సృష్టించండి.`, 'info');
        });

        deleteBookBtn.addEventListener('click', () => {
            if (!currentBookKey) {
                alert("తొలగించడానికి దయచేసి ఒక పుస్తకాన్ని ఎంచుకోండి.");
                return;
            }
            if (confirm(`మీరు '${allBooks[currentBookKey].title}' పుస్తకాన్ని తొలగించడానికి ఖచ్చితంగా అనుకుంటున్నారా?`)) {
                delete allBooks[currentBookKey];
                currentBookKey = null;
                currentSectionKey = null;
                saveBookData();
                renderBookSelect();
                renderSectionSelect();
                updateStatus("పుస్తకం విజయవంతంగా తొలగించబడింది.", 'success');
            }
        });

        addNewSectionBtn.addEventListener('click', () => {
            if (!currentBookKey) {
                alert("మొదట ఒక పుస్తకాన్ని ఎంచుకోండి లేదా సృష్టించండి.");
                return;
            }
            const title = newSectionTitleInput.value.trim();
            if (!title) {
                alert("దయచేసి భాగానికి పేరు ఇవ్వండి.");
                return;
            }
            const key = title.replace(/\s+/g, '');
            if (allBooks[currentBookKey].sections[key]) {
                alert("ఈ పేరుతో ఒక భాగం ఇప్పటికే ఉంది. దయచేసి వేరే పేరు ఎంచుకోండి.");
                return;
            }
            allBooks[currentBookKey].sections[key] = { title: title, mantras: {} };
            currentSectionKey = key;
            saveBookData();
            renderSectionSelect();
            renderMantraTabs();
            sectionSelect.value = key;
            updateStatus(`'${title}' భాగం సృష్టించబడింది. ఇప్పుడు OCR ప్రారంభించండి.`, 'success');
        });

        sectionSelect.addEventListener('change', (e) => {
            currentSectionKey = e.target.value;
            renderMantraTabs();
            updateStatus(`'${allBooks[currentBookKey].sections[currentSectionKey].title}' భాగం ఎంపిక చేయబడింది. మంత్రాన్ని జోడించడానికి సిద్ధంగా ఉంది.`, 'info');
        });

        deleteSectionBtn.addEventListener('click', () => {
            if (!currentBookKey || !currentSectionKey) {
                alert("తొలగించడానికి దయచేసి ఒక భాగాన్ని ఎంచుకోండి.");
                return;
            }
            if (confirm(`మీరు '${allBooks[currentBookKey].sections[currentSectionKey].title}' భాగాన్ని తొలగించడానికి ఖచ్చితంగా అనుకుంటున్నారా?`)) {
                delete allBooks[currentBookKey].sections[currentSectionKey];
                currentSectionKey = null;
                saveBookData();
                renderSectionSelect();
                renderMantraTabs();
                updateStatus("భాగం విజయవంతంగా తొలగించబడింది.", 'success');
            }
        });

        // Existing Event Listeners
        imageInput.addEventListener('change', () => {
            if (imageInput.files.length === 0) return;
            const file = imageInput.files[0];
            preview.src = URL.createObjectURL(file);
            preview.style.display = 'block';
            updateStatus("చిత్రం లోడ్ చేయబడింది. 'OCR ప్రారంభించండి' పై క్లిక్ చేయండి.", 'info');
            btnOcr.disabled = false;
            ocrTextarea.value = "";
            pitchMarks = [];
        });

        btnOcr.addEventListener('click', async () => {
            if (!imageInput.files[0] || !worker) return;
            btnOcr.disabled = true;
            ocrSpinner.style.display = 'inline-block';
            updateStatus("OCR చేస్తోంది...", 'info');
            try {
                const { data } = await worker.recognize(imageInput.files[0], 'tel');
                const sanitizedText = data.text.replace(/[\u030D\u0323]/g, '').trim();
                ocrTextarea.value = sanitizedText;
                const segmenter = new Intl.Segmenter('te', { granularity: 'grapheme' });
                const segments = Array.from(segmenter.segment(sanitizedText));
                pitchMarks = Array(segments.length).fill('none');
                updateStatus("OCR పూర్తయింది. వచనాన్ని ఎంచుకుని పిచ్ బటన్‌ను క్లిక్ చేయండి.", 'success');
            } catch (error) {
                updateStatus("OCR సమయంలో లోపం సంభవించింది. దయచేసి వేరే చిత్రాన్ని ప్రయత్నించండి.", 'error');
                console.error("OCR లోపం:", error);
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
            updateStatus('అన్ని OCR కంటెంట్ తొలగించబడింది. చిత్రాన్ని అప్‌లోడ్ చేసి, మళ్లీ ప్రారంభించండి.', 'info');
            btnSaveMantra.textContent = 'కొత్త పాఠ్యము సేవ్ చేయండి ✨';
        });

        btnSaveMantra.addEventListener('click', () => {
            if (!currentBookKey || !currentSectionKey) {
                alert("మొదట ఒక పుస్తకం మరియు భాగాన్ని ఎంచుకోండి.");
                return;
            }
            const title = mantraTitleInput.value.trim();
            const description = mantraDescriptionInput.value.trim();
            const fullText = ocrTextarea.value;

            if (!title) {
                alert('దయచేసి ఒక ప్రత్యేకమైన పేరు ఇవ్వండి.');
                return;
            }
            const newKey = title.replace(/\s+/g, '');
            if (newKey !== currentMantraKey && allBooks[currentBookKey].sections[currentSectionKey].mantras[newKey]) {
                alert(`'${title}' పేరుతో ఒక పాఠ్యము ఇప్పటికే ఉంది. దయచేసి ప్రత్యేకమైన పేరును ఎంచుకోండి.`);
                return;
            }
            if (fullText.trim().length === 0) {
                alert('OCR అవుట్‌పుట్ ఖాళీగా ఉంది. దయచేసి OCR చేసి, ఆపై సేవ్ చేయండి.');
                return;
            }

            const segmenter = new Intl.Segmenter('te', { granularity: 'grapheme' });
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
            updateStatus(`'${title}' పాఠ్యము విజయవంతంగా సేవ్ చేయబడింది.`, 'success');
            btnSaveMantra.textContent = 'కొత్త మంత్రాన్ని సేవ్ చేయండి ✨';
        });

        btnEditMantra.addEventListener('click', () => {
            if (!currentMantraKey) {
                alert("సవరించడానికి దయచేసి ఒక మంత్రాన్ని ఎంచుకోండి.");
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
                    tempPitchMarks.push('none'); // Add a marker for the newline
                });
            });

            // Remove trailing newline and its pitch marker
            fullText = fullText.trim();
            tempPitchMarks = tempPitchMarks.slice(0, tempPitchMarks.length - 1);

            ocrTextarea.value = fullText;
            pitchMarks = tempPitchMarks;

            updateStatus("మంత్రాన్ని సవరించడానికి సిద్ధంగా ఉంది.", 'info');
            btnSaveMantra.textContent = 'మంత్రాన్ని అప్‌డేట్ చేయండి ✏️';
        });

        btnDownloadMantra.addEventListener('click', downloadBook);

        helperToggleBtn.addEventListener('click', () => {
            const isVisible = helperContent.style.display === 'block';
            helperContent.style.display = isVisible ? 'none' : 'block';
            helperArrow.textContent = isVisible ? '▼' : '▲';
        });

        // Initial rendering on page load
        renderBookSelect();
        renderSectionSelect();
        renderMantraTabs();

async function downloadBook() {
    if (!currentBookKey) {
        alert("దయచేసి డౌన్‌లోడ్ చేయడానికి ఒక పుస్తకాన్ని ఎంచుకోండి.");
        return;
    }

    const book = allBooks[currentBookKey];
    const creationDate = new Date().toLocaleString('te-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });

    const sectionsCount = Object.keys(book.sections).length;
    const totalPages = sectionsCount + 1; // +1 for cover page

    // Build cover page content with total pages info
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="te">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <!-- Add keywords metadata for EPUB search support -->
        <meta name="keywords" content="${book.title}, తెలుగు కవిత్వం, మంత్రాలు, భారతీయ సంస్కృతి, ఆధ్యాత్మికత" />
        <title>${book.title} - తెలుగు కవిత్వం</title>
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
        <p class="pages-info">మొత్తం పేజీలు (భాగాలు + కవర్): ${totalPages}</p>
    `;

    // Build each section with footer showing page number x of y
    let pageIndex = 2; // because 1 is cover
    for (const sectionKey in book.sections) {
        const section = book.sections[sectionKey];
        htmlContent += `<div class="section" aria-label="పాఠం ${pageIndex} - ${section.title}">`;
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
        htmlContent += `<footer class="page-footer">Page ${pageIndex} పేజీ - మొత్తం ${totalPages} పేజీలు</footer>`;
        htmlContent += `</div>`;
        pageIndex++;
    }

    // Add overall footer with creation info (can be first or last page)
    htmlContent += `
    <footer style="text-align: center; padding: 20px; font-family: sans-serif; border-top: 1px solid #e0e0e0; margin-top: 20px; color: #777; font-size: 14px;">
        <p>
            క్రియేట్ చేయబడినది: ${creationDate}<br>
            సృష్టించినవారు: అక్షరధార సాఫ్ట్‌వేర్<br>
            ఎలా రూపొందించబడింది:<br>
            1. చిత్రం OCR చేయబడింది, 2. డిజిటల్ పుస్తకంగా డౌన్‌లోడ్ చేయబడింది.
        </p>
    </footer>
    </body></html>
    `;

    // Generate EPUB file from the htmlContent string
    await generateEpubFromHtml(htmlContent, book.title);
}

async function generateEpubFromHtml(htmlContent, bookTitle) {
    const zip = new JSZip();

    // EPUB requires mimetype file first, uncompressed
    zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

    // META-INF/container.xml required file pointing to package document
    zip.folder("META-INF").file("container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

    const oebps = zip.folder("OEBPS");

    // Wrap HTML content in minimal XHTML document required by EPUB spec
    const chapterXhtml = `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" lang="te">
<head>
  <title>${bookTitle}</title>
  <meta charset="UTF-8"/>
  <style>
    body { font-family: 'Noto Sans Telugu', serif; padding: 1em; line-height: 1.5; }
    h1, h2, h3 { color: #1f3674; }
    .pitch-marked-char.high::before { content: "▲"; color: #1f3674; }
    .pitch-marked-char.low::after { content: "▼"; color: #a08b5e; }
    .pitch-marked-char.svarita::before { content: "⌒"; color: #c0392b; }
    .pitch-marked-char.dirgha-svarita::before { content: "〰"; color: #27ae60; }
    footer.page-footer { font-size: 0.8em; color: #666; text-align: right; margin-top: 2em; }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>`;

    oebps.file("chapter1.html", chapterXhtml);

    // EPUB package file with metadata, manifest, spine
    const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>${bookTitle}</dc:title>
    <dc:language>te</dc:language>
    <dc:identifier id="BookID">urn:uuid:12345</dc:identifier>
    <dc:creator>అక్షరధార సాఫ్ట్‌వేర్</dc:creator>
    <!-- Add searchable keywords in metadata -->
    <dc:subject>తెలుగు కవిత్వం, మంత్రాలు, ఆధ్యాత్మికము, తెలుగు</dc:subject>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="chapter1" href="chapter1.html" media-type="application/xhtml+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="chapter1"/>
  </spine>
</package>`;

    oebps.file("content.opf", contentOpf);

    // Table of contents
    const tocNcx = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN"
  "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:12345"/>
    <meta name="dtb:depth" content="1"/>
  </head>
  <docTitle><text>${bookTitle}</text></docTitle>
  <navMap>
    <navPoint id="navPoint-1" playOrder="1">
      <navLabel><text>అధ్యాయం 1</text></navLabel>
      <content src="chapter1.html"/>
    </navPoint>
  </navMap>
</ncx>`;

    oebps.file("toc.ncx", tocNcx);

    // Generate EPUB file as blob
    const epubBlob = await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });

    // Trigger download using FileSaver.js
    saveAs(epubBlob, `${bookTitle.replace(/\s+/g, '_')}.epub`);
}


