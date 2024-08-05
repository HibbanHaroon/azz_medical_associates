const API_URL = "https://az-medical-p9w9.onrender.com/api/ceos";

export const fetchCEOs = async () => {
  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) {
      throw new Error("Error fetching ceos");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching ceos:", error);
    throw error;
  }
};
