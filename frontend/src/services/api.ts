import API_BASE_URL from "../config/api";

export const getVehicles = async () => {
  const response = await fetch(`${API_BASE_URL}/vehicles`);

  if (!response.ok) {
    throw new Error("Failed to fetch vehicles");
  }

  const result = await response.json();
  return result.data;
};