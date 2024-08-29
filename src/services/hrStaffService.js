const API_URL = "https://az-medical-p9w9.onrender.com/api/hrStaff";

export const fetchHrStaff = async () => {
  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) {
      throw new Error("Error fetching HR staff");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching HR staff:", error);
    throw error;
  }
};

export const addHrStaff = async (hrStaffData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hrStaffData),
    });
    if (!response.ok) {
      throw new Error("Error adding HR staff");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding HR staff:", error);
    throw error;
  }
};

export const updateHrStaff = async (id, hrStaffData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(hrStaffData),
    });
    if (!response.ok) {
      throw new Error("Error updating HR staff");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating HR staff:", error);
    throw error;
  }
};

export const deleteHrStaff = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Error deleting HR staff");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting HR staff:", error);
    throw error;
  }
};
