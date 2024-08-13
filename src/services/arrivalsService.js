// services/arrivalsService.js

import { convertToLocalTime } from "../utils/dateUtils";

// const API_URL = "http://localhost:3001/api/arrivals";
const BASE_API_URL = "https://az-medical-p9w9.onrender.com/api";
const API_URL = "https://az-medical-p9w9.onrender.com/api/arrivals";

// Fetch arrivals with local time conversion
export const fetchArrivals = async (clinicId, doctorId) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}/${doctorId}`);
    if (!response.ok) {
      throw new Error("Error fetching arrivals");
    }
    const data = await response.json();

    // Convert the date fields to local time
    return data.arrivals.map((arrival) => ({
      ...arrival,
      arrivalTime: convertToLocalTime(arrival.arrivalTime),
      calledInTime: arrival.calledInTime
        ? convertToLocalTime(arrival.calledInTime)
        : null,
      dob: convertToLocalTime(arrival.dob),
      endTime: arrival.endTime ? convertToLocalTime(arrival.endTime) : null,
      startTime: arrival.startTime
        ? convertToLocalTime(arrival.startTime)
        : null,
    }));
  } catch (error) {
    console.error("Error fetching arrivals:", error);
    throw error;
  }
};

// Fetch all arrivals with local time conversion
export const fetchAllArrivals = async (clinicId) => {
  try {
    const response = await fetch(`${BASE_API_URL}/${clinicId}/allArrivals`);
    if (!response.ok) {
      throw new Error("Error fetching all arrivals");
    }
    const data = await response.json();

    // Convert the date fields to local time
    return data.map((arrival) => ({
      ...arrival,
      arrivalTime: convertToLocalTime(arrival.arrivalTime),
      calledInTime: arrival.calledInTime
        ? convertToLocalTime(arrival.calledInTime)
        : null,
      dob: convertToLocalTime(arrival.dob),
      endTime: arrival.endTime ? convertToLocalTime(arrival.endTime) : null,
      startTime: arrival.startTime
        ? convertToLocalTime(arrival.startTime)
        : null,
    }));
  } catch (error) {
    console.error("Error fetching all arrivals:", error);
    throw error;
  }
};

// Add arrival with UTC conversion
export const addArrival = async (clinicId, arrivalData) => {
  try {
    // Convert the date fields to UTC
    const arrivalDataWithUTC = {
      ...arrivalData,
      arrivalTime: convertToLocalTime(arrivalData.arrivalTime),
      dob: convertToLocalTime(arrivalData.dob),
    };

    const response = await fetch(`${API_URL}/${clinicId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(arrivalDataWithUTC),
    });
    if (!response.ok) {
      throw new Error("Error adding arrival");
    }
    return response;
  } catch (error) {
    console.error("Error adding arrival:", error);
    throw error;
  }
};

// Update arrival with UTC conversion
export const updateArrivalAskedToWait = async (
  clinicId,
  arrivalId,
  arrivalData
) => {
  try {
    const response = await fetch(
      `${API_URL}/${clinicId}/${arrivalId}/askedToWait`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(arrivalData),
      }
    );
    if (!response.ok) {
      throw new Error("Error updating arrival");
    }
    return response;
  } catch (error) {
    console.error("Error updating arrival:", error);
    throw error;
  }
};

// Update arrival with UTC conversion
export const updateArrivalMarkExit = async (
  clinicId,
  arrivalId,
  arrivalData
) => {
  try {
    const response = await fetch(
      `${API_URL}/${clinicId}/${arrivalId}/markExit`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...arrivalData,
          endTime: convertToLocalTime(arrivalData.endTime),
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Error updating arrival");
    }
    return response;
  } catch (error) {
    console.error("Error updating arrival:", error);
    throw error;
  }
};

// Update arrival with UTC conversion
export const updateArrivalInProgress = async (
  clinicId,
  arrivalId,
  arrivalData
) => {
  try {
    const response = await fetch(
      `${API_URL}/${clinicId}/${arrivalId}/inProgress`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...arrivalData,
          startTime: convertToLocalTime(arrivalData.startTime),
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Error updating arrival");
    }
    return response;
  } catch (error) {
    console.error("Error updating arrival:", error);
    throw error;
  }
};

// Update arrival with UTC conversion
export const updateArrivalCalledInside = async (
  clinicId,
  arrivalId,
  arrivalData
) => {
  try {
    const response = await fetch(
      `${API_URL}/${clinicId}/${arrivalId}/calledInside`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...arrivalData,
          calledInTime: convertToLocalTime(arrivalData.calledInTime),
        }),
      }
    );
    if (!response.ok) {
      throw new Error("Error updating arrival");
    }
    return response;
  } catch (error) {
    console.error("Error updating arrival:", error);
    throw error;
  }
};

// Similarly, you can add other update functions like updateArrivalCalledInside, updateArrivalInProgress, updateArrivalMarkExit

// export const deleteArrival = async (clinicId, arrivalId) => {
//   try {
//     const response = await fetch(`${API_URL}/${clinicId}/${arrivalId}`, {
//       method: "DELETE",
//     });
//     if (!response.ok) {
//       throw new Error("Error deleting arrival");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error deleting arrival:", error);
//     throw error;
//   }
// };
