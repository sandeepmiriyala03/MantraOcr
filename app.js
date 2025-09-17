let detectionModel, recognitionModel;
const runBtn = document.getElementById('runBtn');
const fileInput = document.getElementById('imageInput');
const outputText = document.getElementById('outputText');

// Disable the Run button until models successfully load
runBtn.disabled = true;

// Full vocabulary array including uppercase, lowercase, symbols, and blank token
const teluguVocab = [
  /* Uppercase English letters */
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P',
  'Q','R','S','T','U','V','W','X','Y','Z',
  /* Lowercase English letters */
  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p',
  'q','r','s','t','u','v','w','x','y','z',
  /* Common symbols */
  '!','@','#','$','%','^','&','*','(',')','-','_','=','+','[',']',
  '{','}',';',':',',','.','<','>','/','?','|','\\','\'','"','`','~',' ',
  /* Blank token (CTC) */
  '_'
];

// Loads detection and recognition models before enabling the OCR UI
async function loadModels() {
  try {
    outputText.value = "Loading models, please wait...";
    console.log('Loading models...');

    detectionModel = await tf.loadGraphModel('/models/db_mobilenet_v2/model.json');
    recognitionModel = await tf.loadGraphModel('/models/crnn_mobilenet_v2/model.json');

    console.log('Models loaded successfully');
    outputText.value = "Models loaded successfully. You can select an image now.";
    runBtn.disabled = false;
  } catch (err) {
    console.error('Failed to load models:', err);
    outputText.value = "Failed to load models. Please check console for details.";
    alert('Failed to load models. Check console for details.');
  }
}

// Preprocess uploaded full image for detection: resize and scale pixel values
async function preprocessImage(image) {
  return tf.tidy(() =>
    tf.browser.fromPixels(image)
      .resizeNearestNeighbor([512, 512])  // Adjust input size matching detection model
      .toFloat()
      .div(255.0)
      .expandDims(0)                      // Add batch dimension
  );
}

// Preprocess cropped detected region for recognition: resize to 32x128 pixels, normalize
function preprocessCrop(imageTensor) {
  return tf.tidy(() =>
    tf.image.resizeBilinear(imageTensor, [32, 128])
      .div(255.0)
      .expandDims(0)
  );
}

// Decode model output tensor to text using greedy CTC decoding
function decodeOutput(prediction) {
  // prediction tensor shape: [1, time_steps, num_classes]
  // Step 1: Apply softmax over classes axis to get probabilities
  const probs = tf.softmax(prediction, -1);

  // Step 2: Get index with highest probability at each time step
  const indices = probs.argMax(-1).dataSync();

  let decoded = '';
  let prevIdx = null;

  for (let i = 0; i < indices.length; i++) {
    const currIdx = indices[i];
    // Filter out repeated indices, blanks, and invalid vocab characters
    if (
      currIdx !== prevIdx &&
      currIdx < teluguVocab.length &&
      teluguVocab[currIdx] !== '_' &&
      teluguVocab[currIdx].match(/^[A-Za-z0-9!@#$%^&*()\-\_=+\[\]{};:,.<>\/?|\'"`~ ]$/)
    ) {
      decoded += teluguVocab[currIdx];
    }
    prevIdx = currIdx;
  }

  // Debugging: log sample prediction data
  prediction.data().then(data => console.log('Sample prediction data:', data.slice(0, 20)));

  return decoded || '[No valid text decoded]';
}

// Parse detection model output tensor to extract bounding boxes
function parseDetectionBoxes(detectionResult) {
  const boxesTensor = detectionResult;
  const boxes = boxesTensor.arraySync()[0];
  // Optional: Add confidence score filtering if available
  return boxes;
}

// Main OCR routine triggered when user clicks Run OCR
async function runOCR() {
  if (!detectionModel || !recognitionModel) {
    outputText.value = "Models not loaded yet!";
    alert('Models not loaded yet!');
    return;
  }

  if (!fileInput.files.length) {
    outputText.value = "Please select an image first.";
    alert('Please select an image first');
    return;
  }

  const file = fileInput.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = async () => {
    outputText.value = "Running text detection...";
    const inputTensor = await preprocessImage(img);

    try {
      // Run the detection model to get bounding boxes
      const detectionResult = await detectionModel.executeAsync(inputTensor);
      const boxes = parseDetectionBoxes(detectionResult);

      if (!boxes.length) {
        outputText.value = "No text regions detected.";
        return;
      }

      outputText.value = `Detected ${boxes.length} text regions. Starting recognition...\n`;

      let resultsText = '';

      // Process each detected box region
      for (const [index, box] of boxes.entries()) {
        const ymin = Math.floor(box[0] * img.height);
        const xmin = Math.floor(box[1] * img.width);
        const ymax = Math.floor(box[2] * img.height);
        const xmax = Math.floor(box[3] * img.width);
        const width = xmax - xmin;
        const height = ymax - ymin;

        // Skip invalid or zero-sized boxes
        if (width <= 0 || height <= 0) {
          console.warn(`Skipping invalid crop #${index + 1}`);
          continue;
        }

        outputText.value += `Processing region ${index + 1} of ${boxes.length}...\n`;

        // Crop detected region from original image tensor
        const cropTensor = tf.tidy(() => {
          const imgTensor = tf.browser.fromPixels(img);
          return imgTensor.slice([ymin, xmin, 0], [height, width, 3]);
        });

        // Preprocess crop and run recognition model
        const recogInput = preprocessCrop(cropTensor);
        const pred = await recognitionModel.executeAsync(recogInput);

        // Decode recognition result to string
        const recognizedText = decodeOutput(pred);
        resultsText += recognizedText + '\n';

        // Dispose intermediate tensors
        tf.dispose([cropTensor, recogInput, pred]);
      }

      outputText.value += '\nRecognition complete!\n\n' + resultsText;

      // Select output text for convenience
      if (outputText.select) {
        outputText.focus();
        outputText.select();
      }

      // Dispose detection and input tensors
      tf.dispose(detectionResult);
      tf.dispose(inputTensor);
    } catch (error) {
      console.error('Inference error:', error);
      outputText.value = "Error during OCR inference. Please check console for details.";
      alert('Error during OCR inference. See console.');
    }
  };

  img.onerror = () => {
    outputText.value = "Failed to load the image. Please try a different file.";
    alert('Failed to load the image. Please try a different file.');
  };
}

runBtn.addEventListener('click', runOCR);

loadModels();
