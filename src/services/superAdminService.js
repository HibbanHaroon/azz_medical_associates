const API_URL = "https://az-medical.onrender.com/api/superAdmins";

export const fetchSuperAdmins = async () => {
  try {
    const response = await fetch(`${API_URL}`);
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

export const addSuperAdmin = async (superAdminData) => {
  try {
    const response = await fetch(`${API_URL}`, {
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

export const updateSuperAdmin = async (id, superAdminData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
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

export const deleteSuperAdmin = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
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
