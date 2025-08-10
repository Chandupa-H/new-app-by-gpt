// src/services/esp32Api.js

// HARD-CODED ESP32 IP
const ESP32_IP = "172.25.249.214"; // <-- Change to your ESP32 IP
const BASE_URL = `http://${ESP32_IP}`;

export const sendMotorCommand = async (direction, speed = 50) => {
  try {
    console.log(
      `Sending motor command to ESP32: ${direction}, speed: ${speed}`
    );

    const response = await fetch(`${BASE_URL}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `direction=${direction}`,
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
