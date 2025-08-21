// src/services/esp32Api.js
// http://172.25.249.127/

// HARD-CODED ESP32 IP
const ESP32_IP = "172.25.249.22"; // <-- Change to your ESP32 IP
const BASE_URL = `http://${ESP32_IP}`;

export const sendActuatorCommand = async (motor, direction) => {
  try {
    const response = await fetch(`${BASE_URL}/${motor}/${direction}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to send command: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error("Error sending motor command:", error);
    throw error;
  }
};
