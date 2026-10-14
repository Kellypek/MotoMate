import { useEffect, useState } from "react";
import { ArrowLeft, Save, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const initialForm = {
  motorcycle_id: "",
  service_type: "",
  service_date: new Date().toISOString().slice(0, 10),
  service_mileage: "",
  interval_km: "3000",
  cost: "0",
  notes: "",
};

export default function MaintenanceForm({
  motorcycles = [],
  record = null,
  onSubmit,
  onCancel,
  saving = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (record) {
      setForm({
        motorcycle_id: String(record.motorcycle_id ?? ""),
        service_type: record.service_type ?? "",
        service_date: record.service_date ?? "",
        service_mileage: String(record.service_mileage ?? ""),
        interval_km: String(record.interval_km ?? "3000"),
        cost: String(record.cost ?? "0"),
        notes: record.notes ?? "",
      });
    } else {
      setForm({
        ...initialForm,
        motorcycle_id: motorcycles.length
          ? String(motorcycles[0].id)
          : "",
      });
    }

    setError("");
  }, [record, motorcycles]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.motorcycle_id) {
      setError("Please select a motorcycle.");
      return;
    }

    if (!form.service_type.trim()) {
      setError("Please enter the service type.");
      return;
    }

    if (!form.service_date) {
      setError("Please select the service date.");
      return;
    }

    if (
      form.service_mileage === "" ||
      !Number.isFinite(Number(form.service_mileage)) ||
      Number(form.service_mileage) < 0
    ) {
      setError("Service mileage must be zero or greater.");
      return;
    }

    if (
      form.interval_km === "" ||
      !Number.isFinite(Number(form.interval_km)) ||
      Number(form.interval_km) <= 0
    ) {
      setError("Service interval must be greater than zero.");
      return;
    }

    if (
      form.cost === "" ||
      !Number.isFinite(Number(form.cost)) ||
      Number(form.cost) < 0
    ) {
      setError("Cost must be zero or greater.");
      return;
    }

    const payload = {
      service_type: form.service_type.trim(),
      service_date: form.service_date,
      service_mileage: Number(form.service_mileage),
      interval_km: Number(form.interval_km),
      cost: Number(form.cost),
      notes: form.notes.trim(),
    };

    try {
      await onSubmit?.(Number(form.motorcycle_id), payload);
    } catch (err) {
      setError(err.message || "Unable to save maintenance record.");
    }
  }

  return (
    <Card className="mx-auto max-w-3xl border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-50 p-3 text-cyan-700">
            <Wrench size={22} />
          </div>

          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              {record ? "Edit Maintenance Record" : "Add Maintenance Record"}
            </CardTitle>

            <p className="mt-1 text-sm text-slate-500">
              Record your motorcycle service details.
            </p>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-6">
        {motorcycles.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Please add a motorcycle before recording maintenance.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="motorcycle_id"
                className="text-sm font-medium text-slate-700"
              >
                Motorcycle *
              </label>

              <select
                id="motorcycle_id"
                name="motorcycle_id"
                value={form.motorcycle_id}
                onChange={handleChange}
                required
                disabled={Boolean(record)}
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">Select a motorcycle</option>

                {motorcycles.map((bike) => (
                  <option key={bike.id} value={bike.id}>
                    {bike.brand} {bike.model} — {bike.registration_number}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="service_type"
                className="text-sm font-medium text-slate-700"
              >
                Service Type *
              </label>

              <Input
                id="service_type"
                name="service_type"
                value={form.service_type}
                onChange={handleChange}
                placeholder="e.g. Engine Oil Change"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="service_date"
                  className="text-sm font-medium text-slate-700"
                >
                  Service Date *
                </label>

                <Input
                  id="service_date"
                  name="service_date"
                  type="date"
                  value={form.service_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="service_mileage"
                  className="text-sm font-medium text-slate-700"
                >
                  Mileage (km) *
                </label>

                <Input
                  id="service_mileage"
                  name="service_mileage"
                  type="number"
                  min="0"
                  step="1"
                  value={form.service_mileage}
                  onChange={handleChange}
                  placeholder="e.g. 12000"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="interval_km"
                  className="text-sm font-medium text-slate-700"
                >
                  Next Service Interval (km) *
                </label>

                <Input
                  id="interval_km"
                  name="interval_km"
                  type="number"
                  min="1"
                  step="1"
                  value={form.interval_km}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="cost"
                  className="text-sm font-medium text-slate-700"
                >
                  Cost (RM) *
                </label>

                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.cost}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="text-sm font-medium text-slate-700"
              >
                Notes
              </label>

              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Optional service notes..."
                rows={4}
                className="flex min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-cyan-600"
                />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={saving}
              >
                <ArrowLeft size={16} className="mr-2" />
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving || motorcycles.length === 0}
              >
                <Save size={16} className="mr-2" />
                {saving
                  ? "Saving..."
                  : record
                    ? "Save Changes"
                    : "Add Record"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}