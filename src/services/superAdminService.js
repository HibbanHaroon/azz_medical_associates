const API_URL = "https://az-medical.onrender.com/api/superAdmins";

export const fetchSuperAdmins = async (clinicId) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`);
    if (!response.ok) {
      throw new Error("Error fetching super admins");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching super admins:", error);
    throw error;
  }
};

export const addSuperAdmin = async (clinicId, superAdminData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(superAdminData),
    });
    if (!response.ok) {
      throw new Error("Error adding super admin");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding super admin:", error);
    throw error;
  }
};

export const updateSuperAdmin = async (clinicId, id, superAdminData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(superAdminData),
    });
    if (!response.ok) {
      throw new Error("Error updating super admin");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating super admin:", error);
    throw error;
  }
};

export const deleteSuperAdmin = async (clinicId, id) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Error deleting super admin");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting super admin:", error);
    throw error;
  }
};
