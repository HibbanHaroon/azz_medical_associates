// services/moderatorService.js

const API_URL = "https://az-medical.onrender.com/api/moderators";

export const fetchModerators = async (clinicId) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`);
    if (!response.ok) {
      throw new Error("Error fetching moderators");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching moderators:", error);
    throw error;
  }
};

export const addModerator = async (clinicId, moderatorData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(moderatorData),
    });
    if (!response.ok) {
      throw new Error("Error adding moderator");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding moderator:", error);
    throw error;
  }
};

export const updateModerator = async (clinicId, id, moderatorData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(moderatorData),
    });
    if (!response.ok) {
      throw new Error("Error updating moderator");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating moderator:", error);
    throw error;
  }
};

export const deleteModerator = async (clinicId, id) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Error deleting moderator");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting moderator:", error);
    throw error;
  }
};
