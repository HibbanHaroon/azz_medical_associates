// services/clinicService.js

const API_URL = "https://az-medical-p9w9.onrender.com/api/clinics";

// Fetch all clinics
export const getAllClinics = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch clinics");
  }
  return response.json();
};

// Add a new clinic
export const addClinic = async (clinic) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(clinic),
  });
  if (!response.ok) {
    throw new Error("Failed to add clinic");
  }
  return response.json();
};

// Update a clinic
export const updateClinic = async (id, clinic) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(clinic),
  });
  if (!response.ok) {
    throw new Error("Failed to update clinic");
  }
  return response.json();
};

// Delete a clinic
export const deleteClinic = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete clinic");
  }
  return response.json();
};
