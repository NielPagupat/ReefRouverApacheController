const video = document.getElementById('video');
const switchCameraButton = document.getElementById('switchCameraButton');
let currentStream = null;
let videoDevices = [];
let currentCameraIndex = 0;

// Start the camera with the given deviceId
async function startCamera(deviceId) {
  if (currentStream) {
    // Stop all tracks on the current stream to release the camera
    currentStream.getTracks().forEach(track => track.stop());
  }
  
  try {
    const constraints = {
      video: { deviceId: deviceId ? { exact: deviceId } : undefined }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    currentStream = stream;
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
}

// Get a list of video input devices (cameras)
async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    videoDevices = devices.filter(device => device.kind === 'videoinput');
    
    // Start with the first camera in the list if available
    if (videoDevices.length > 0) {
      startCamera(videoDevices[currentCameraIndex].deviceId);
    }
  } catch (error) {
    console.error("Error listing cameras:", error);
  }
}

// Cycle to the next camera when the button is clicked
function switchCamera() {
  if (videoDevices.length > 1) {
    // Move to the next camera index, looping back to the start if needed
    currentCameraIndex = (currentCameraIndex + 1) % videoDevices.length;
    startCamera(videoDevices[currentCameraIndex].deviceId);
  } else {
    console.log("Only one camera available");
  }
}

// Initialize by getting the list of cameras
window.addEventListener('load', getCameras);

// Attach event listener to the switch camera button
switchCameraButton.addEventListener('click', switchCamera);

//button handlers
  // Function to handle actions based on button or key press
  function handleAction(action, isActive) {
    const button = document.getElementById(action);
    if (isActive) {
      button.classList.add("bg-green-500", "text-white", "ring-4", "ring-green-400");
    } else {
      button.classList.remove("bg-green-500", "text-white", "ring-4", "ring-green-400");
    }
  }

  // Map of keys to button IDs
  const keyToButtonId = {
    "q": "release",
    "w": "forward",
    "e": "intake",
    "a": "left",
    " ": "stop",          // Spacebar
    "d": "right",
    "h": "hover",
    "s": "backward",
    "f": "thrusters"
  };

  // Set of keys with toggle functionality (q, e, h, f)
  const toggleKeys = new Set(["q", "e", "h", "f"]);

  // Add event listeners for keydown and keyup
  document.addEventListener("keydown", (event) => {
    const buttonId = keyToButtonId[event.key.toLowerCase()];
    if (buttonId) {
      if (toggleKeys.has(event.key.toLowerCase())) {
        const button = document.getElementById(buttonId);
        // Toggle active state on keypress for toggle keys
        if (button.classList.contains("bg-green-500")) {
          handleAction(buttonId, false); // Deactivate if already active
        } else {
          handleAction(buttonId, true);  // Activate if not active
        }
      } else {
        handleAction(buttonId, true); // Always activate for non-toggle keys
      }
    }
  });

  document.addEventListener("keyup", (event) => {
    const buttonId = keyToButtonId[event.key.toLowerCase()];
    if (buttonId && !toggleKeys.has(event.key.toLowerCase())) {
      handleAction(buttonId, false); // Deactivate non-toggle keys on keyup
    }
  });

  // Add click event listeners for each button
  document.getElementById("release").addEventListener("click", () => toggleButtonState("release"));
  document.getElementById("forward").addEventListener("click", () => handleAction("forward", true));
  document.getElementById("intake").addEventListener("click", () => handleAction("intake", true));
  document.getElementById("left").addEventListener("click", () => handleAction("left", true));
  document.getElementById("stop").addEventListener("click", () => handleAction("stop", true));
  document.getElementById("right").addEventListener("click", () => handleAction("right", true));
  document.getElementById("hover").addEventListener("click", () => toggleButtonState("hover"));
  document.getElementById("backward").addEventListener("click", () => handleAction("backward", true));
  document.getElementById("thrusters").addEventListener("click", () => handleAction("thrusters", true));

  // Toggle button state (for q, e, h, f)
  function toggleButtonState(buttonId) {
    const button = document.getElementById(buttonId);
    if (button.classList.contains("bg-green-500")) {
      handleAction(buttonId, false); // Deactivate button if it's active
    } else {
      handleAction(buttonId, true); // Activate button if it's not active
    }
  }