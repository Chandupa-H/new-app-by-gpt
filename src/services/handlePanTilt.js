// src/services/esp32Api.js

// HARD-CODED ESP32 IP
const ESP32_IP = "172.25.249.124"; // <-- Change to your ESP32's IP
const BASE_URL = `http://${ESP32_IP}`;

export const sendESP32Command = async (cmd, value = "") => {
  try {
    console.log(`Sending command to ESP32: ${cmd}, value: ${value}`);

    // Construct query string
    const url = `${BASE_URL}/cmd?cmd=${encodeURIComponent(cmd)}${
      value !== "" ? `&value=${encodeURIComponent(value)}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to send command: ${response.statusText}`);
    }

    return await response.text(); // ESP32 responds with "OK"
  } catch (error) {
    console.error("Error sending command to ESP32:", error);
    throw error;
  }
};
