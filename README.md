### `README.md`

### **Project Name: Sanskrit / Telugu OCR & Mantra Manager**

This is a web-based application designed to help users digitize, manage, and practice sacred mantras with proper pitch notation. The tool uses a simple, single-page interface to extract Sanskrit and Telugu text from images, allowing for detailed editing and the addition of traditional pitch marks before saving the data directly in the browser.

---

### **Features**

* **Image to Text (OCR):** Uses Tesseract.js to convert images containing Sanskrit or Telugu script into editable text.
* **Pitch Marking:** Allows users to mark syllables as high-pitched (**ఉదాత్తం**) or low-pitched (**అనుదాత్తం**) using traditional Vedic notations (a vertical line above and a horizontal line below).
* **Local Storage:** All mantras and their associated pitch marks are saved directly to your browser's local storage, ensuring your data persists between sessions.
* **Mantra Management:** Users can save new mantras, view existing ones, and edit or delete them.
* **JSON Export:** The application includes a "Download JSON" button to export your complete mantra collection to a `ritualsMantras.json` file.

---

### **Technologies Used**

* **HTML:** For the application structure.
* **CSS:** For styling and layout.
* **JavaScript:** For all interactive functionality, including OCR, pitch marking, and local storage management.
* **Tesseract.js:** An open-source OCR library used to process images.
* **Google Fonts:** `Noto Sans Telugu` and `Roboto` for clear and readable typography.

---

### **How to Use**

1.  **Save the File:** Download the `MantraGenration.html` file and open it in any modern web browser (like Chrome, Firefox, or Edge).
2.  **Upload an Image:** Click the **"Upload Image"** button and select an image file containing the mantra you want to digitize.
3.  **Start OCR:** Once the image is loaded, click **"Start OCR"**. The extracted text will appear in the text area below.
4.  **Edit & Mark Pitches:**
    * Correct any errors in the extracted text.
    * Select a word or syllable and click **"High Pitch"** or **"Low Pitch"** to add the corresponding pitch mark.
5.  **Save the Mantra:** Enter a title and description, then click **"Save New Mantra"** to store it.
6.  **View & Edit Saved Mantras:** Use the tabs in the **"View & Edit Mantras"** section to see your saved mantras. You can click **"Edit Mantra"** to load it back into the OCR section for further changes.
7.  **Download Your Data:** Click **"Download JSON"** to save your entire collection as a `ritualsMantras.json` file.

---

### **File Structure**

This is a self-contained single-page application, so all the code is within one `MantraGenration.html` file. There are no external dependencies other than the Tesseract.js library and Google Fonts, which are loaded from CDNs.
