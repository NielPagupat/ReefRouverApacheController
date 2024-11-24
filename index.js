// button handlers handling and MQTT client setup //

document.addEventListener("DOMContentLoaded", function () {
  const videoElement = document.querySelector('img[alt="Live Feed"]');
  const ws = new WebSocket('ws://10.0.254.10:8000/ws/video_feed/');

  ws.onopen = function () {
      console.log("WebSocket connection opened.");
  };

  ws.onmessage = (event) => {
      const frameBase64 = event.data;
      if (videoElement) {
          videoElement.src = `data:image/jpeg;base64,${frameBase64}`;
      }
  };

  ws.onclose = () => {
      console.error('WebSocket closed');
  };
});



// MQTT client setup
const client = mqtt.connect('ws://10.0.254.4:9001'); // Example WebSocket broker

// Display connection status
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('RouverState', (err) => {
    if (err) {
      console.log(`Failed to subscribe to RouverState: ${err}`);
    } else {
      console.log('Subscribed to RouverState');
    }
  });
});

// Handle MQTT connection errors
client.on('error', (err) => {
  console.log(`Connection error: ${err}`);

  
});

// Function to publish a message to a topic
function publishMessage(mes) {
  const topic = 'Controller'; // Topic to publish
  const message = mes; // Message to send
  
  // Publish the message to the topic
  client.publish(topic, message, { qos: 1 }, (err) => {
    if (err) {
      console.log(`Publish failed: ${err}`);
    } else {
      console.log(`Message published to ${topic}: ${message}`);
    }
  });
}

// Function to handle actions based on button or key press
function handleAction(action, isActive) {
  const button = document.getElementById(action);
  if (isActive) {
    button.classList.add("bg-green-500", "text-white", "ring-4", "ring-green-400");
  } else {
    button.classList.remove("bg-green-500", "text-white", "ring-4", "ring-green-400");
  }
}

// Map of keys to button IDs and MQTT messages
const keyToButtonId = {
  "q": { id: "release", message: "q", stop:"o"},
  "w": { id: "forward", message: "D", stop:"x"},
  "e": { id: "intake", message: "e", stop:"p"},
  "a": { id: "left", message: "W", stop:"x"},
  " ": { id: "stop", message: "x", stop:"x"},  // Spacebar
  "d": { id: "right", message: "S", stop:"x"},
  "h": { id: "hover", message: "h", stop:"j"},
  "s": { id: "backward", message: "A", stop:"x"},
  "f": { id: "thrusters", message: "f", stop:"t"}
};

// Set of keys with toggle functionality (q, e, h, f)
const toggleKeys = new Set(["q", "e", "h", "f"]);

// Track active state for toggle buttons
const activeToggles = {};

// Add event listeners for keydown and keyup
document.addEventListener("keydown", (event) => {
  const keyData = keyToButtonId[event.key.toLowerCase()];
  if (keyData) {
    const { id: buttonId, message, stop} = keyData;

    if (toggleKeys.has(event.key.toLowerCase())) {
      // Handle toggle keys: only send message when state changes
      const button = document.getElementById(buttonId);
      if (button.classList.contains("bg-green-500")) {
        handleAction(buttonId, false); // Deactivate if already active
        publishMessage(`${stop}`); // Publish OFF message
      } else {
        handleAction(buttonId, true);  // Activate if not active
        publishMessage(`${message}`); // Publish ON message
      }
    } else {
      // Non-toggle keys: only publish if button isn't already active
      if (!buttonId in activeToggles || !activeToggles[buttonId]) {
        handleAction(buttonId, true); // Activate button
        publishMessage(`${message}`); // Publish ON message
        activeToggles[buttonId] = true; // Mark as active
      }
    }
  }
});

document.addEventListener("keyup", (event) => {
  const keyData = keyToButtonId[event.key.toLowerCase()];
  if (keyData && !toggleKeys.has(event.key.toLowerCase())) {
    const { id: buttonId, message, stop } = keyData;
    handleAction(buttonId, false); // Deactivate button
    publishMessage(`${stop}`); // Publish OFF message
    activeToggles[buttonId] = false; // Mark as inactive
  }
});

// Add click event listeners for each button
document.getElementById("release").addEventListener("click", () => toggleButtonState("release", "Q"));
document.getElementById("forward").addEventListener("click", () => handleAction("forward", true));
document.getElementById("intake").addEventListener("click", () => handleAction("intake", true));
document.getElementById("left").addEventListener("click", () => handleAction("left", true));
document.getElementById("stop").addEventListener("click", () => handleAction("stop", true));
document.getElementById("right").addEventListener("click", () => handleAction("right", true));
document.getElementById("hover").addEventListener("click", () => toggleButtonState("hover", "H"));
document.getElementById("backward").addEventListener("click", () => handleAction("backward", true));
document.getElementById("thrusters").addEventListener("click", () => handleAction("thrusters", true));

// Toggle button state (for q, e, h, f) with MQTT message
function toggleButtonState(buttonId, message) {
  const button = document.getElementById(buttonId);
  if (button.classList.contains("bg-green-500")) {
    handleAction(buttonId, false); // Deactivate button if it's active
    publishMessage(`${message}-OFF`); // Publish OFF message
  } else {
    handleAction(buttonId, true); // Activate button if it's not active
    publishMessage(`${message}-ON`); // Publish ON message
  }
}


// Listen for new messages on the "RouverState" topic
client.on('message', (topic, message) => {
    if (topic === 'RouverState') {
      // Display the message in the "stateinfo" div as an <h1> element
      const stateInfoDiv = document.getElementById('stateinfo');
      
      // Create a new h1 element to display the message
      const newMessage = document.createElement('h1');
      newMessage.classList.add("border",
                                "border-black",
                                "p-1",
                                "rounded-md",
                                "bg-slate-200",
                                "text-lg",
                                "font-mono",
                                "m-1")
      newMessage.textContent = message.toString();
      
      // Append the new message to the stateinfo div
      stateInfoDiv.appendChild(newMessage);
      
      // Make the div scrollable once content overflows
      if (stateInfoDiv.scrollHeight > stateInfoDiv.clientHeight) {
        stateInfoDiv.classList.add('overflow-y-auto');
      }
      // Scroll to the newest message
      stateInfoDiv.scrollTop = stateInfoDiv.scrollHeight;
    }
  });