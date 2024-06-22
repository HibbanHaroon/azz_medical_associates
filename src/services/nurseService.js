// services/nurseService.js

const API_URL = "https://az-medical-p9w9.onrender.com/api/nurses";

export const fetchNurses = async (clinicId) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`);
    if (!response.ok) {
      throw new Error("Error fetching nurses");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching nurses:", error);
    throw error;
  }
};

export const addNurse = async (clinicId, nurseData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nurseData),
    });
    if (!response.ok) {
      throw new Error("Error adding nurse");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding nurse:", error);
    throw error;
  }
};

export const updateNurse = async (clinicId, id, nurseData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nurseData),
    });
    if (!response.ok) {
      throw new Error("Error updating nurse");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating nurse:", error);
    throw error;
  }
};

export const deleteNurse = async (clinicId, id) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Error deleting nurse");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting nurse:", error);
    throw error;
  }
};
