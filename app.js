let detectionModel, recognitionModel;
const runBtn = document.getElementById('runBtn');
const fileInput = document.getElementById('imageInput');
const outputText = document.getElementById('outputText');

runBtn.disabled = true;

const teluguVocab = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P',
  'Q','R','S','T','U','V','W','X','Y','Z',
  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p',
  'q','r','s','t','u','v','w','x','y','z',
  '!','@','#','$','%','^','&','*','(',')','-','_','=','+','[',']',
  '{','}',';',':',',','.','<','>','/','?','|','\\','\'','"','`','~',' ',
  '_'
];

// Load models
async function loadModels() {
  try {
    outputText.value = "Loading models, please wait...";
    detectionModel = await tf.loadGraphModel('/models/db_mobilenet_v2/model.json');
    recognitionModel = await tf.loadGraphModel('/models/crnn_mobilenet_v2/model.json');
    outputText.value = "Models loaded successfully. You can select an image now.";
    runBtn.disabled = false;
  } catch (err) {
    console.error('Failed to load models:', err);
    outputText.value = "Failed to load models. Please check console for details.";
    alert('Failed to load models. Check console for details.');
  }
}

// Preprocess image for detection
async function preprocessImage(image) {
  return tf.tidy(() =>
    tf.browser.fromPixels(image)
      .resizeNearestNeighbor([512, 512])
      .toFloat()
      .div(255.0)
      .expandDims(0)
  );
}

// Preprocess crop for recognition
function preprocessCrop(imageTensor) {
  return tf.tidy(() =>
    tf.image.resizeBilinear(imageTensor, [32, 128])
      .div(255.0)
      .expandDims(0)
  );
}

// Decode recognition output using greedy CTC decoding
function decodeOutput(prediction) {
  const probs = tf.softmax(prediction, -1);
  const indices = probs.argMax(-1).dataSync();

  let decoded = '';
  let prevIdx = null;
  for (let i = 0; i < indices.length; i++) {
    const currIdx = indices[i];
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

  prediction.data().then(data => console.log('Sample prediction data:', data.slice(0, 20)));
  return decoded || '[No valid text decoded]';
}

// Parse boxes and scores from detection model output
function parseDetectionBoxesAndScores(detectionResult, scoreTensor, threshold=0.5) {
  const boxes = detectionResult.arraySync()[0];
  const scores = scoreTensor.arraySync()[0];

  const filteredBoxes = [];
  for (let i = 0; i < boxes.length; i++) {
    if (scores[i] >= threshold) {
      filteredBoxes.push(boxes[i]);
    }
  }
  return filteredBoxes;
}

// Run OCR on button click
async function runOCR() {
  if (!detectionModel || !recognitionModel) {
    outputText.value = "Models not loaded yet!";
    alert('Models not loaded yet!');
    return;
  }
  if (!fileInput.files.length) {
    outputText.value = "Please select an image first.";
    alert('Please select an image first.');
    return;
  }

  const file = fileInput.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = async () => {
    outputText.value = "Running text detection...";
    const inputTensor = await preprocessImage(img);

    try {
      // The detection model may output two tensors: boxes and scores: confirm your model docs
      const detectionResult = await detectionModel.executeAsync(inputTensor);
      // For example: detectionResult could be array of tensors [boxes, scores]
      // Adjust based on your model
      let boxes, scores;
      if (Array.isArray(detectionResult)) {
        [boxes, scores] = detectionResult;
      } else {
        boxes = detectionResult;
        scores = null;
      }

      // Filter boxes by confidence scores if available, else take raw boxes
      let filteredBoxes = [];
      if (scores) {
        filteredBoxes = parseDetectionBoxesAndScores(boxes, scores, 0.5);
        tf.dispose(scores);
      } else {
        filteredBoxes = boxes.arraySync()[0];
      }

      tf.dispose(boxes);

      if (!filteredBoxes.length) {
        outputText.value = "No text regions detected.";
        tf.dispose(inputTensor);
        return;
      }

      outputText.value = `Detected ${filteredBoxes.length} text regions. Starting recognition...\n`;
      let resultsText = '';

      for (const [index, box] of filteredBoxes.entries()) {
        const ymin = Math.floor(box[0] * img.height);
        const xmin = Math.floor(box[1] * img.width);
        const ymax = Math.floor(box[2] * img.height);
        const xmax = Math.floor(box[3] * img.width);

        const width = xmax - xmin;
        const height = ymax - ymin;

        if (width <= 0 || height <= 0) {
          console.warn(`Skipping invalid crop #${index + 1}`);
          continue;
        }

        outputText.value += `Processing region ${index + 1} of ${filteredBoxes.length}...\n`;

        const cropTensor = tf.tidy(() => {
          const imgTensor = tf.browser.fromPixels(img);
          return imgTensor.slice([ymin, xmin, 0], [height, width, 3]);
        });

        const recogInput = preprocessCrop(cropTensor);
        const pred = await recognitionModel.executeAsync(recogInput);

        const recognizedText = decodeOutput(pred);
        resultsText += recognizedText + "\n";

        tf.dispose([cropTensor, recogInput, pred]);
      }

      outputText.value += "\nRecognition complete!\n\n" + resultsText;

      if (outputText.select) {
        outputText.focus();
        outputText.select();
      }

      tf.dispose(inputTensor);

    } catch (err) {
      console.error('Inference error:', err);
      outputText.value = "Error during OCR inference. Please check console for details.";
      alert('Error during OCR inference. See console.');
    }
  };

  img.onerror = () => {
    outputText.value = "Failed to load the image. Please try a different file.";
    alert('Failed to load the image. Please try a different file.');
  };
}

runBtn.addEventListener("click", runOCR);

loadModels();
