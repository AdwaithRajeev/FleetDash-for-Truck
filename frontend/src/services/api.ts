const API_BASE_URL = "http://localhost:5050";

export const getVehicles = async () => {
  const response = await fetch(`${API_BASE_URL}/vehicles`);

  if (!response.ok) {
    throw new Error("Failed to fetch vehicles");
  }

  const result = await response.json();

  return result.data;
};

export const getVehicle = async (vehicleId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/vehicles/${vehicleId}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch vehicle");
  }

  const result = await response.json();

  return result.data;
};

export const getFleetStats = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/stats`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch fleet stats");
  }

  return response.json();
};