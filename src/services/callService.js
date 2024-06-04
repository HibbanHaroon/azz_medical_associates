// services/callService.js

// const API_URL = "http://localhost:3001/api/calls";
const API_URL = "https://az-medical.onrender.com/api/calls";

export const fetchCallRequests = async (clinicId) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`);
    if (!response.ok) {
      throw new Error("Error fetching call requests");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching call requests:", error);
    throw error;
  }
};

export const addCallRequest = async (clinicId, callRequestData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(callRequestData),
    });
    if (!response.ok) {
      throw new Error("Error adding call request");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding call request:", error);
    throw error;
  }
};

export const updateCallRequest = async (clinicId, id, requestAttended) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id, requestAttended }),
    });
    if (!response.ok) {
      throw new Error("Error updating call request");
    }
    return response;
  } catch (error) {
    console.error("Error updating call request:", error);
    throw error;
  }
};
