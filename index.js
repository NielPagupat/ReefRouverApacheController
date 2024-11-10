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