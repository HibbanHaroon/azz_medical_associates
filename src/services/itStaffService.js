const API_URL = "https://az-medical-p9w9.onrender.com/api/itStaff";

export const fetchItStaff = async () => {
  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) {
      throw new Error("Error fetching IT staff");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching IT staff:", error);
    throw error;
  }
};

export const addItStaff = async (itStaffData) => {
  try {
    const response = await fetch(`${API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itStaffData),
    });
    if (!response.ok) {
      throw new Error("Error adding IT staff");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding IT staff:", error);
    throw error;
  }
};

export const updateItStaff = async (id, itStaffData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itStaffData),
    });
    if (!response.ok) {
      throw new Error("Error updating IT staff");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating IT staff:", error);
    throw error;
  }
};

export const deleteItStaff = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Error deleting IT staff");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting IT staff:", error);
    throw error;
  }
};
