// services/adminService.js

const API_URL = "https://az-medical-p9w9.onrender.com/api/admins";

export const fetchAdmins = async (clinicId) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`);
    if (!response.ok) {
      throw new Error("Error fetching admins");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching admins:", error);
    throw error;
  }
};

export const addAdmin = async (clinicId, adminData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminData),
    });
    if (!response.ok) {
      throw new Error("Error adding admin");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding admin:", error);
    throw error;
  }
};

export const updateAdmin = async (clinicId, id, adminData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(adminData),
    });
    if (!response.ok) {
      throw new Error("Error updating admin");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating admin:", error);
    throw error;
  }
};

export const deleteAdmin = async (clinicId, id) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Error deleting admin");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw error;
  }
};
