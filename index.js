// Select the video element
const video = document.getElementById('video');

// Access the camera
async function startCamera() {
  try {
    // Request access to the camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Set the video element's source to the camera stream
    video.srcObject = stream;
  } catch (error) {
    console.error("Error accessing camera:", error);
  }
}

// Start the camera when the page loads
window.addEventListener('load', startCamera);
