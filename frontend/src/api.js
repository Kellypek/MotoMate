const API_BASE_URL = "http://127.0.0.1:5000";

async function request(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong.");
  }

  return data;
}

export function getMotorcycles() {
  return request("/motorcycles");
}

export function getMotorcycleStatus(motorcycleId) {
  return request(`/motorcycles/${motorcycleId}/status`);
}

export function getMaintenanceRecords(motorcycleId) {
  return request(`/motorcycles/${motorcycleId}/maintenance`);
}

export function createMotorcycle(motorcycle) {
  return request("/motorcycles", {
    method: "POST",
    body: JSON.stringify(motorcycle),
  });
}


export function updateMotorcycle(motorcycleId, motorcycle) {
  return request(`/motorcycles/${motorcycleId}`, {
    method: "PUT",
    body: JSON.stringify(motorcycle),
  });
}

export function deleteMotorcycle(motorcycleId) {
  return request(`/motorcycles/${motorcycleId}`, {
    method: "DELETE",
  });
}

export function createMaintenanceRecord(motorcycleId, record) {
  return request(`/motorcycles/${motorcycleId}/maintenance`, {
    method: "POST",
    body: JSON.stringify(record),
  });
}

export function updateMaintenanceRecord(maintenanceId, record) {
  return request(`/maintenance/${maintenanceId}`, {
    method: "PUT",
    body: JSON.stringify(record),
  });
}

export function deleteMaintenanceRecord(maintenanceId) {
  return request(`/maintenance/${maintenanceId}`, {
    method: "DELETE",
  });
}