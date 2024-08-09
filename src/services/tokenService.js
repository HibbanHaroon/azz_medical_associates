import { convertToLocalTime, convertToUTC } from "../utils/dateUtils";

const BASE_API_URL = "https://az-medical-p9w9.onrender.com/api";
const TOKEN_API_URL = `${BASE_API_URL}/tokens`;

export const getTokenForClinic = async (clinicId) => {
  try {
    const response = await fetch(`${TOKEN_API_URL}/${clinicId}`);
    if (!response.ok) {
      throw new Error("Error fetching token");
    }
    const tokenData = await response.json();

    // Convert lastUpdated to local time
    if (tokenData.lastUpdated) {
      tokenData.lastUpdated = convertToLocalTime(tokenData.lastUpdated);
    }

    return tokenData;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw error;
  }
};

export const addTokenForClinic = async (clinicId) => {
  try {
    const currentDate = new Date().toISOString().split("T")[0];

    // Check if the token exists
    let tokenData = await getTokenForClinic(clinicId).catch(() => null);

    // If token doesn't exist, start with token: 1
    if (!tokenData) {
      tokenData = { token: 1, lastUpdated: convertToUTC(new Date()) };
    } else {
      const lastUpdatedDate = tokenData.lastUpdated.split(" ")[0];

      // If the token is not of the current day, reset it to 1
      if (lastUpdatedDate !== currentDate) {
        tokenData.token = 1;
      } else {
        // If the token is of the current day, increment it
        tokenData.token += 1;
      }
      tokenData.lastUpdated = convertToUTC(new Date());
    }

    const response = await fetch(`${TOKEN_API_URL}/${clinicId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tokenData),
    });

    if (!response.ok) {
      throw new Error("Error adding/updating token");
    }
    return tokenData;
  } catch (error) {
    console.error("Error adding/updating token:", error);
    throw error;
  }
};

export const updateTokenForClinic = async (clinicId, newToken) => {
  try {
    const tokenData = {
      token: newToken,
      lastUpdated: convertToUTC(new Date()),
    };

    const response = await fetch(`${TOKEN_API_URL}/${clinicId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tokenData),
    });

    if (!response.ok) {
      throw new Error("Error updating token");
    }
    return tokenData;
  } catch (error) {
    console.error("Error updating token:", error);
    throw error;
  }
};
