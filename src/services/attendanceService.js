// services/attendanceService.js

const API_URL = "https://az-medical-p9w9.onrender.com/api/attendance";

export const fetchAttendance = async (clinicId) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`);
    if (!response.ok) {
      throw new Error("Error fetching attendance records");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    throw error;
  }
};

export const addAttendance = async (clinicId, attendanceData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attendanceData),
    });
    if (!response.ok) {
      throw new Error("Error adding attendance record");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding attendance record:", error);
    throw error;
  }
};

export const updateAttendance = async (clinicId, id, attendanceData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(attendanceData),
    });
    if (!response.ok) {
      throw new Error("Error updating attendance record");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating attendance record:", error);
    throw error;
  }
};

export const deleteAttendance = async (clinicId, id) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Error deleting attendance record");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting attendance record:", error);
    throw error;
  }
};
