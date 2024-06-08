// services/arrivalsService.js

// const API_URL = "http://localhost:3001/api/arrivals";
const BASE_API_URL = "https://az-medical.onrender.com/api";
const API_URL = "https://az-medical.onrender.com/api/arrivals";

export const fetchArrivals = async (clinicId, doctorId) => {
  try {
    console.log(clinicId);
    console.log(doctorId);
    const response = await fetch(`${API_URL}/${clinicId}/${doctorId}`);
    if (!response.ok) {
      throw new Error("Error fetching arrivals");
    }
    const data = await response.json();
    return data.arrivals;
  } catch (error) {
    console.error("Error fetching arrivals:", error);
    throw error;
  }
};

export const fetchAllArrivals = async (clinicId) => {
  try {
    const response = await fetch(`${BASE_API_URL}/${clinicId}/allArrivals`);
    if (!response.ok) {
      throw new Error("Error fetching all arrivals");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching all arrivals:", error);
    throw error;
  }
};

export const addArrival = async (clinicId, arrivalData) => {
  try {
    const response = await fetch(`${API_URL}/${clinicId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(arrivalData),
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
