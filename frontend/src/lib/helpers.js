export { cn } from "cn"

export function normalizeStatus(status) {
  const value = String(status ?? "")
    .toUpperCase()
    .replace(/_/g, " ")
    .trim();

  if (value.includes("OVERDUE")) return "Overdue";
  if (value.includes("DUE SOON")) return "Due Soon";
  if (value === "OK") return "OK";

  return "Unknown";
}

export function formatMileage(value) {
  const mileage = Number(value);

  if (!Number.isFinite(mileage)) return "—";

  return `${mileage.toLocaleString("en-MY")} km`;
}

export function formatCost(value) {
  const cost = Number(value);

  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (!Number.isFinite(cost)) return "—";

  return `RM ${cost.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getRecordRemainingKm(record) {
  const currentMileage = Number(record?.current_mileage);
  const serviceMileage = Number(record?.service_mileage);
  const intervalKm = Number(record?.interval_km);

  if (
    !Number.isFinite(currentMileage) ||
    !Number.isFinite(serviceMileage) ||
    !Number.isFinite(intervalKm)
  ) {
    return null;
  }

  const nextService = serviceMileage + intervalKm;

  return nextService - currentMileage;
}
