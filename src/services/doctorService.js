// services/doctorService.js

const API_URL = "http://localhost:3001/api/doctors";
// const API_URL = "https://az-medical.onrender.com/api/doctors";

export const fetchDoctors = async (clinicId) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`);
    if (!response.ok) {
      throw new Error("Error fetching doctors");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching doctors:", error);
    throw error;
  }
};

export const addDoctor = async (clinicId, doctorData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(doctorData),
    });
    if (!response.ok) {
      throw new Error("Error adding doctor");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding doctor:", error);
    throw error;
  }
};

export const updateDoctor = async (clinicId, id, doctorData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(doctorData),
    });
    if (!response.ok) {
      throw new Error("Error updating doctor");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating doctor:", error);
    throw error;
  }
};

export const deleteDoctor = async (clinicId, id) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Error deleting doctor");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting doctor:", error);
    throw error;
  }
};
