// --- DOM Elements ---
const videoElement = document.getElementById('webcam-video');
const captureBtn = document.getElementById('capture-btn');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('file-upload');
const hiddenCanvas = document.getElementById('hidden-canvas');
const hiddenCtx = hiddenCanvas.getContext('2d');
const overlayCanvas = document.getElementById('overlay-canvas');
const overlayCtx = overlayCanvas.getContext('2d');

hiddenCanvas.width = 630;
hiddenCanvas.height = 810;

// --- Camera Initialization ---
async function startScanner() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1080 } } 
        });
        videoElement.srcObject = stream;
    } catch (error) {
        console.error("Camera failed: ", error);
    }
}
startScanner();

// --- Live Processing Logic ---
function processIcaoResults(modelData) {
    let allPassed = true;
    for (const [ruleKey, isPassing] of Object.entries(modelData)) {
        const listItem = document.getElementById(ruleKey);
        if (listItem) {
            if (isPassing) {
                listItem.className = "passed";
            } else {
                listItem.className = "failed";
                allPassed = false; 
            }
        }
    }
    if (allPassed) {
        captureBtn.disabled = false;
        captureBtn.style.background = "#52c41a"; 
    } else {
        captureBtn.disabled = true;
        captureBtn.style.background = ""; 
    }
}

// --- Upload & Remove Photo Logic ---
let isPhotoUploaded = false;

uploadBtn.addEventListener('click', () => {
    if (isPhotoUploaded) {
        isPhotoUploaded = false;
        fileInput.value = ""; 
        hiddenCtx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        overlayCanvas.style.zIndex = "-1"; 
        videoElement.style.opacity = "1";
        videoElement.play();
        captureBtn.innerText = "Capture Live Photo";
        captureBtn.disabled = true; 
        captureBtn.style.background = "";
        uploadBtn.innerText = "Upload Saved Photo";
        uploadBtn.style.background = "#f4f4f5";
        uploadBtn.style.color = "#333";
    } else {
        fileInput.click();
    }
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        videoElement.pause();
        videoElement.style.opacity = "0"; 

        const scale = Math.min(hiddenCanvas.width / img.width, hiddenCanvas.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (hiddenCanvas.width - scaledWidth) / 2;
        const y = (hiddenCanvas.height - scaledHeight) / 2;

        hiddenCtx.fillStyle = "black";
        hiddenCtx.fillRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
        hiddenCtx.drawImage(img, x, y, scaledWidth, scaledHeight);

        overlayCanvas.width = hiddenCanvas.width;
        overlayCanvas.height = hiddenCanvas.height;
        overlayCtx.fillStyle = "black";
        overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        overlayCtx.drawImage(img, x, y, scaledWidth, scaledHeight);

        overlayCanvas.style.width = "100%";
        overlayCanvas.style.height = "100%";
        overlayCanvas.style.position = "absolute";
        overlayCanvas.style.top = "0";
        overlayCanvas.style.left = "0";
        overlayCanvas.style.zIndex = "10"; 
        
        isPhotoUploaded = true;
        captureBtn.disabled = false;
        captureBtn.style.background = "#52c41a"; 
        captureBtn.innerText = "Submit Uploaded Photo";
        uploadBtn.innerText = "Remove Photo";
        uploadBtn.style.background = "#ff4d4f"; 
        uploadBtn.style.color = "white";
    };
    img.src = URL.createObjectURL(file);
});

// --- Backend Connection (WebSockets) ---
const ws = new WebSocket('wss://ungalling-natalya-glossarially.ngrok-free.dev/ws'); 

ws.onopen = () => {
    console.log("Successfully connected to Fareedah's Python server!");
};

ws.onmessage = (event) => {
    const modelData = JSON.parse(event.data);
    processIcaoResults(modelData);
    
    if (isPhotoUploaded) {
        captureBtn.innerText = "Submit Uploaded Photo";
        captureBtn.disabled = false;
    }
};

ws.onerror = (error) => {
    console.error("WebSocket error:", error);
};

captureBtn.addEventListener('click', () => {
    if (ws.readyState === WebSocket.OPEN) {
        captureBtn.innerText = "Analyzing Biometrics...";
        captureBtn.disabled = true;
        const base64Image = hiddenCanvas.toDataURL('image/jpeg', 0.9);
        ws.send(JSON.stringify({ image_data: base64Image }));
    } else {
        alert("Cannot connect to the backend server.");
    }
});