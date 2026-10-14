
import { useEffect, useState } from "react";
import { Bike, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getInitialForm(motorcycle) {
  return {
    brand: motorcycle?.brand ?? "",
    model: motorcycle?.model ?? "",
    registration_number: motorcycle?.registration_number ?? "",
    year: motorcycle?.year ?? new Date().getFullYear(),
    current_mileage: motorcycle?.current_mileage ?? 0,
  };
}

export default function MotorcycleForm({
  motorcycle = null,
  onSubmit,
  onCancel,
  saving = false,
}) {
  const [form, setForm] = useState(() => getInitialForm(motorcycle));
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(getInitialForm(motorcycle));
    setError("");
  }, [motorcycle]);

  const isEditing = Boolean(motorcycle);

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

    if (
      !form.brand.trim() ||
      !form.model.trim() ||
      !form.registration_number.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const year = Number(form.year);
    const mileage = Number(form.current_mileage);
    const currentYear = new Date().getFullYear();

    if (
      !Number.isInteger(year) ||
      year < 1900 ||
      year > currentYear + 1
    ) {
      setError("Please enter a valid motorcycle year.");
      return;
    }

    if (!Number.isFinite(mileage) || mileage < 0) {
      setError("Mileage must be zero or greater.");
      return;
    }

    try {
      await onSubmit({
        brand: form.brand.trim(),
        model: form.model.trim(),
        registration_number: form.registration_number.trim().toUpperCase(),
        year,
        current_mileage: mileage,
      });
    } catch (err) {
      setError(err.message || "Unable to save the motorcycle.");
    }
  }

  return (
    <Card className="mx-auto w-full max-w-2xl border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-50 p-3 text-cyan-700">
            <Bike size={23} />
          </div>

          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              {isEditing ? "Edit Motorcycle" : "Add Motorcycle"}
            </CardTitle>

            <p className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Update your motorcycle information."
                : "Register a motorcycle in your garage."}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close motorcycle form"
          onClick={onCancel}
          disabled={saving}
        >
          <X size={19} />
        </Button>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="brand" className="mb-2 block text-sm font-medium text-slate-700">
                Brand <span className="text-red-500">*</span>
              </label>
              <Input
                id="brand"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g. Yamaha"
                required
              />
            </div>

            <div>
              <label htmlFor="model" className="mb-2 block text-sm font-medium text-slate-700">
                Model <span className="text-red-500">*</span>
              </label>
              <Input
                id="model"
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="e.g. Y15ZR"
                required
              />
            </div>

            <div>
              <label
                htmlFor="registration_number"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Registration Number <span className="text-red-500">*</span>
              </label>
              <Input
                id="registration_number"
                name="registration_number"
                value={form.registration_number}
                onChange={handleChange}
                placeholder="e.g. ABC1234"
                required
              />
            </div>

            <div>
              <label htmlFor="year" className="mb-2 block text-sm font-medium text-slate-700">
                Year <span className="text-red-500">*</span>
              </label>
              <Input
                id="year"
                name="year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={form.year}
                onChange={handleChange}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="current_mileage"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Current Mileage (km) <span className="text-red-500">*</span>
              </label>
              <Input
                id="current_mileage"
                name="current_mileage"
                type="number"
                min="0"
                step="1"
                value={form.current_mileage}
                onChange={handleChange}
                required
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Enter the current odometer reading.
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 pt-5 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Save Motorcycle"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
