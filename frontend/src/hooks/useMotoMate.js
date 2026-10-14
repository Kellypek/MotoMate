
import { useEffect, useState } from "react";

import {
  getMotorcycles,
  getMotorcycleStatus,
  createMotorcycle,
  updateMotorcycle,
  deleteMotorcycle,
  createMaintenanceRecord,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from "@/api";

import { normalizeStatus } from "@/lib/helpers";

function getRemainingKm(record) {
  const currentMileage = Number(record.current_mileage);
  const serviceMileage = Number(record.service_mileage);
  const intervalKm = Number(record.interval_km);

  if (
    record.current_mileage == null ||
    record.service_mileage == null ||
    record.interval_km == null ||
    !Number.isFinite(currentMileage) ||
    !Number.isFinite(serviceMileage) ||
    !Number.isFinite(intervalKm)
  ) {
    return null;
  }

  return serviceMileage + intervalKm - currentMileage;
}

export default function useMotoMate() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [motorcycles, setMotorcycles] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [failedBikeIds, setFailedBikeIds] = useState([]);

  const [editingMotorcycle, setEditingMotorcycle] = useState(null);
  const [editingMaintenance, setEditingMaintenance] = useState(null);

  const [savingMotorcycle, setSavingMotorcycle] = useState(false);
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const bikes = await getMotorcycles();

        if (cancelled) return;

        const bikeList = Array.isArray(bikes) ? bikes : [];
        setMotorcycles(bikeList);

        const results = await Promise.all(
          bikeList.map(async (bike) => {
            try {
              const data = await getMotorcycleStatus(bike.id);
              const records = Array.isArray(data.maintenance)
                ? data.maintenance
                : [];

              return {
                bike,
                records: records.map((record) => ({
                  ...record,
                  motorcycle_id: bike.id,
                  current_mileage: bike.current_mileage,
                  brand: bike.brand,
                  model: bike.model,
                  registration_number: bike.registration_number,
                })),
                failed: false,
              };
            } catch (err) {
              console.error(
                `Failed to load status for motorcycle ${bike.id}:`,
                err
              );

              return { bike, records: [], failed: true };
            }
          })
        );

        if (cancelled) return;

        setMaintenanceRecords(
          results.flatMap((result) => result.records)
        );

        setFailedBikeIds(
          results
            .filter((result) => result.failed)
            .map((result) => result.bike.id)
        );
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load MotoMate data:", err);

        setError(
          err.message ||
            "Unable to load data. Please check your backend connection."
        );

        setMotorcycles([]);
        setMaintenanceRecords([]);
        setFailedBikeIds([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const overdueCount = maintenanceRecords.filter((record) => {
    const remainingKm = getRemainingKm(record);

    return (
      normalizeStatus(record.status) === "Overdue" ||
      (remainingKm !== null && remainingKm <= 0)
    );
  }).length;

  const dueSoonCount = maintenanceRecords.filter((record) => {
    const remainingKm = getRemainingKm(record);
    return remainingKm !== null && remainingKm > 0 && remainingKm <= 500;
  }).length;

 
async function refreshMaintenanceForMotorcycle(motorcycleId, bikeOverride) {
  const data = await getMotorcycleStatus(motorcycleId);

  // Update the motorcycle's current mileage from the backend.
  const latestBike = data.motorcycle;

  if (latestBike) {
    setMotorcycles((previous) =>
      previous.map((bike) =>
        Number(bike.id) === Number(motorcycleId)
          ? { ...bike, ...latestBike }
          : bike
      )
    );
  }

  const bike =
    latestBike ||
    bikeOverride ||
    motorcycles.find(
      (item) => Number(item.id) === Number(motorcycleId)
    );

  const records = Array.isArray(data.maintenance)
    ? data.maintenance
    : [];

  const refreshedRecords = records.map((record) => ({
    ...record,
    motorcycle_id: motorcycleId,
    current_mileage: bike?.current_mileage,
    brand: bike?.brand,
    model: bike?.model,
    registration_number: bike?.registration_number,
  }));

  setMaintenanceRecords((previous) => [
    ...previous.filter(
      (record) =>
        Number(record.motorcycle_id) !== Number(motorcycleId)
    ),
    ...refreshedRecords,
  ]);

  setFailedBikeIds((previous) =>
    previous.filter((id) => Number(id) !== Number(motorcycleId))
  );
}

  async function handleCreateMotorcycle(motorcycleData) {
    setSavingMotorcycle(true);
    setError("");

    try {
      const result = await createMotorcycle(motorcycleData);

      const newMotorcycle = {
        ...motorcycleData,
        id: result.id,
      };

      setMotorcycles((previous) => [...previous, newMotorcycle]);

      try {
        await refreshMaintenanceForMotorcycle(
          result.id,
          newMotorcycle
        );
      } catch (err) {
        console.error(
          "Motorcycle saved, but status could not be loaded:",
          err
        );
      }

      setActivePage("My Motorcycles");
    } catch (err) {
      throw new Error(err.message || "Failed to save motorcycle.");
    } finally {
      setSavingMotorcycle(false);
    }
  }

  async function handleUpdateMotorcycle(motorcycleData) {
    if (!editingMotorcycle) return;

    setSavingMotorcycle(true);
    setError("");

    try {
      await updateMotorcycle(editingMotorcycle.id, motorcycleData);

      const updatedBike = {
        ...editingMotorcycle,
        ...motorcycleData,
      };

      setMotorcycles((previous) =>
        previous.map((bike) =>
          Number(bike.id) === Number(editingMotorcycle.id)
            ? updatedBike
            : bike
        )
      );

      try {
        await refreshMaintenanceForMotorcycle(
          updatedBike.id,
          updatedBike
        );
      } catch (err) {
        console.error("Could not refresh maintenance status:", err);
      }

      setEditingMotorcycle(null);
      setActivePage("My Motorcycles");
    } catch (err) {
      throw new Error(err.message || "Failed to update motorcycle.");
    } finally {
      setSavingMotorcycle(false);
    }
  }

  async function handleDeleteMotorcycle(bike) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${bike.brand} ${bike.model} (${bike.registration_number})?`
    );

    if (!confirmed) return;

    try {
      await deleteMotorcycle(bike.id);

      setMotorcycles((previous) =>
        previous.filter(
          (item) => Number(item.id) !== Number(bike.id)
        )
      );

      setMaintenanceRecords((previous) =>
        previous.filter(
          (record) =>
            Number(record.motorcycle_id) !== Number(bike.id)
        )
      );

      setFailedBikeIds((previous) =>
        previous.filter((id) => Number(id) !== Number(bike.id))
      );

      if (Number(editingMotorcycle?.id) === Number(bike.id)) {
        setEditingMotorcycle(null);
      }

      if (Number(editingMaintenance?.motorcycle_id) === Number(bike.id)) {
        setEditingMaintenance(null);
        setActivePage("Maintenance History");
      }
    } catch (err) {
      window.alert(err.message || "Failed to delete motorcycle.");
    }
  }

  async function handleCreateMaintenance(motorcycleId, recordData) {
    setSavingMaintenance(true);

    try {
      await createMaintenanceRecord(motorcycleId, recordData);

      try {
        await refreshMaintenanceForMotorcycle(motorcycleId);
      } catch (err) {
        console.error("Record saved, but refresh failed:", err);
      }

      setActivePage("Maintenance History");
    } catch (err) {
      throw new Error(
        err.message || "Failed to create maintenance record."
      );
    } finally {
      setSavingMaintenance(false);
    }
  }

  async function handleUpdateMaintenance(_motorcycleId, recordData) {
    if (!editingMaintenance) return;

    setSavingMaintenance(true);

    try {
      await updateMaintenanceRecord(editingMaintenance.id, recordData);

      try {
        await refreshMaintenanceForMotorcycle(
          editingMaintenance.motorcycle_id
        );
      } catch (err) {
        console.error("Record updated, but refresh failed:", err);
      }

      setEditingMaintenance(null);
      setActivePage("Maintenance History");
    } catch (err) {
      throw new Error(
        err.message || "Failed to update maintenance record."
      );
    } finally {
      setSavingMaintenance(false);
    }
  }

  async function handleDeleteMaintenance(record) {
    const confirmed = window.confirm(
      `Delete the "${record.service_type}" maintenance record?`
    );

    if (!confirmed) return;

    try {
      await deleteMaintenanceRecord(record.id);

      setMaintenanceRecords((previous) =>
        previous.filter(
          (item) => Number(item.id) !== Number(record.id)
        )
      );
    } catch (err) {
      window.alert(err.message || "Failed to delete maintenance record.");
    }
  }

  return {
    activePage,
    setActivePage,
    motorcycles,
    maintenanceRecords,
    failedBikeIds,
    editingMotorcycle,
    setEditingMotorcycle,
    editingMaintenance,
    setEditingMaintenance,
    savingMotorcycle,
    savingMaintenance,
    loading,
    error,
    overdueCount,
    dueSoonCount,
    handleCreateMotorcycle,
    handleUpdateMotorcycle,
    handleDeleteMotorcycle,
    handleCreateMaintenance,
    handleUpdateMaintenance,
    handleDeleteMaintenance,
  };
}
