import { Bike, Plus, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import Status from "./Status";
import {
  formatMileage,
  getRecordRemainingKm,
  normalizeStatus,
} from "@/lib/helpers";

export default function Garage({
  motorcycles = [],
  maintenanceRecords = [],
  failedBikeIds = [],
  loading = false,
  searchQuery = "",
  setActivePage,
  onEditMotorcycle,
  onDeleteMotorcycle,
}) {
  const filteredMotorcycles = motorcycles.filter((bike) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) return true;

    return [
      bike.brand,
      bike.model,
      bike.registration_number,
      String(bike.year ?? ""),
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  });

  function getBikeRecords(bikeId) {
    return maintenanceRecords.filter(
      (record) => Number(record.motorcycle_id) === Number(bikeId)
    );
  }

  function getBikeStatus(bike) {
    if (failedBikeIds.includes(bike.id)) {
      return "Unknown";
    }

    const records = getBikeRecords(bike.id);

    if (records.length === 0) {
      return "Unknown";
    }

    const statuses = records.map((record) => {
      const remainingKm = getRecordRemainingKm({
        ...record,
        current_mileage: bike.current_mileage,
      });

      if (remainingKm === null) return "Unknown";
      if (remainingKm <= 0) return "Overdue";
      if (remainingKm <= 500) return "Due Soon";

      return "OK";
    });

    if (statuses.includes("Overdue")) return "Overdue";
    if (statuses.includes("Due Soon")) return "Due Soon";
    if (statuses.every((status) => status === "OK")) return "OK";

    return "Unknown";
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900">
            My Garage
          </CardTitle>

          <p className="mt-1 text-sm text-slate-500">
            Your registered motorcycles
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          className="bg-slate-900 text-white hover:bg-slate-800"
          onClick={() => setActivePage?.("Add Motorcycle")}
        >
          <Plus size={16} className="mr-1" />
          Add Motorcycle
        </Button>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading motorcycles...
          </div>
        ) : filteredMotorcycles.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-10 text-center">
            {searchQuery ? (
              <>
                <Search size={28} className="mb-3 text-slate-400" />
                <p className="font-medium text-slate-700">
                  No motorcycles found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try a different search term.
                </p>
              </>
            ) : (
              <>
                <Bike size={32} className="mb-3 text-slate-400" />
                <p className="font-medium text-slate-700">
                  No motorcycles registered yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add a motorcycle to start tracking its maintenance.
                </p>
              </>
            )}
          </div>
        ) : (
          <div>
            {filteredMotorcycles.map((bike, index) => {
              const records = getBikeRecords(bike.id);
              const status = getBikeStatus(bike);

              const nearestRecord = records
                .map((record) => ({
                  ...record,
                  remainingKm: getRecordRemainingKm({
                    ...record,
                    current_mileage: bike.current_mileage,
                  }),
                }))
                .filter((record) => record.remainingKm !== null)
                .sort((a, b) => a.remainingKm - b.remainingKm)[0];

              return (
                <div key={bike.id}>
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                      <Bike size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {bike.brand} {bike.model}
                        </h3>

                        <Badge variant="outline" className="text-xs">
                          {bike.year || "Year unknown"}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {bike.registration_number || "No registration number"}
                      </p>

                      <p className="mt-2 text-sm font-medium text-slate-700">
                        {formatMileage(bike.current_mileage)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                      <div className="min-w-28">
                        <Status status={status} />

                        <p className="mt-2 text-xs text-slate-500">
                          {failedBikeIds.includes(bike.id)
                            ? "Status unavailable"
                            : nearestRecord
                              ? nearestRecord.remainingKm <= 0
                                ? `${formatMileage(Math.abs(nearestRecord.remainingKm))} overdue`
                                : `${formatMileage(nearestRecord.remainingKm)} remaining`
                              : "No service data"}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEditMotorcycle?.(bike)}
                      >
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActivePage?.("Maintenance History")}
                      >
                        History
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onDeleteMotorcycle?.(bike)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {index < filteredMotorcycles.length - 1 && <Separator />}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
