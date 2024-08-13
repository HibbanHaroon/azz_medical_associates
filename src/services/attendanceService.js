import { convertToLocalTime } from "../utils/dateUtils";

const API_URL = "https://az-medical-p9w9.onrender.com/api/attendance";

// Fetch all attendance records for a specific clinic
export const fetchAttendance = async (clinicId) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`);
    if (!response.ok) {
      throw new Error("Error fetching attendance records");
    }
    const data = await response.json();

    // Convert datetime, checkInTime, and checkOutTime to local time
    data.forEach((record) => {
      record.pastThirtyDays = record.pastThirtyDays.map((day) => {
        if (day.datetime) {
          day.datetime = convertToLocalTime(day.datetime);
        }
        if (day.checkInTime) {
          day.checkInTime = convertToLocalTime(day.checkInTime);
        }
        if (day.checkOutTime) {
          day.checkOutTime = convertToLocalTime(day.checkOutTime);
        }
        return day;
      });
    });

    return data;
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    throw error;
  }
};

// Add or update attendance for the last 30 days
export const addOrUpdateAttendance = async (clinicId, attendanceData) => {
  const { id, datetime, status, nurseName, checkInTime, checkOutTime } =
    attendanceData;

  try {
    const currentDate = new Date(datetime);
    const existingAttendance = await fetchAttendanceById(clinicId, id);

    let pastThirtyDays =
      existingAttendance?.pastThirtyDays ||
      initializePastThirtyDays(currentDate);

    const lastRecordedDate = new Date(pastThirtyDays[0]?.datetime);

    // Using ceil instead of floor, cause there was a bug where the date was being skipped
    const daysSkipped = Math.ceil(
      (currentDate - lastRecordedDate) / (1000 * 60 * 60 * 24)
    );

    if (daysSkipped > 0) {
      for (let i = 0; i < daysSkipped; i++) {
        pastThirtyDays.unshift({
          checkInTime: null,
          checkOutTime: null,
          status: "absent",
          datetime: convertToLocalTime(
            new Date(lastRecordedDate.setDate(lastRecordedDate.getDate() + 1))
          ),
        });
      }
      pastThirtyDays = pastThirtyDays.slice(0, 30);
    }

    pastThirtyDays[0] = {
      checkInTime: checkInTime ? convertToLocalTime(checkInTime) : null,
      checkOutTime: checkOutTime ? convertToLocalTime(checkOutTime) : null,
      status,
      datetime: convertToLocalTime(currentDate),
    };

    const updatedAttendance = { nurseName, pastThirtyDays };

    if (existingAttendance) {
      return await updateAttendance(clinicId, id, updatedAttendance);
    } else {
      return await addAttendance(clinicId, { id, ...updatedAttendance });
    }
  } catch (error) {
    console.error("Error adding or updating attendance record:", error);
    throw error;
  }
};

const initializePastThirtyDays = (currentDate) => {
  const pastThirtyDays = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - i);
    pastThirtyDays.push({
      checkInTime: null,
      checkOutTime: null,
      status: "absent",
      datetime: convertToLocalTime(date),
    });
  }
  return pastThirtyDays;
};

// Fetch a specific attendance record by ID
const fetchAttendanceById = async (clinicId, id) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${id}`);
    if (response.status === 404) {
      return null; // Return null if attendance record not found
    }
    if (!response.ok) {
      throw new Error(
        `Error fetching attendance record: ${response.statusText}`
      );
    }
    const data = await response.json();

    // Convert datetime, checkInTime, and checkOutTime to local time
    data.pastThirtyDays = data.pastThirtyDays.map((day) => {
      if (day.datetime) {
        day.datetime = convertToLocalTime(day.datetime);
      }
      if (day.checkInTime) {
        day.checkInTime = convertToLocalTime(day.checkInTime);
      }
      if (day.checkOutTime) {
        day.checkOutTime = convertToLocalTime(day.checkOutTime);
      }
      return day;
    });

    return data;
  } catch (error) {
    console.error("Error fetching attendance record:", error);
    return null;
  }
};

// Existing functions for adding, updating, and deleting attendance records

export const addAttendance = async (clinicId, attendanceData) => {
  try {
    // Convert dates to UTC before saving
    attendanceData.pastThirtyDays = attendanceData.pastThirtyDays.map((day) => {
      return {
        ...day,
        datetime: convertToLocalTime(day.datetime),
        checkInTime: day.checkInTime
          ? convertToLocalTime(day.checkInTime)
          : null,
        checkOutTime: day.checkOutTime
          ? convertToLocalTime(day.checkOutTime)
          : null,
      };
    });

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
    // Convert dates to UTC before updating
    attendanceData.pastThirtyDays = attendanceData.pastThirtyDays.map((day) => {
      return {
        ...day,
        datetime: convertToLocalTime(day.datetime),
        checkInTime: day.checkInTime
          ? convertToLocalTime(day.checkInTime)
          : null,
        checkOutTime: day.checkOutTime
          ? convertToLocalTime(day.checkOutTime)
          : null,
      };
    });

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
