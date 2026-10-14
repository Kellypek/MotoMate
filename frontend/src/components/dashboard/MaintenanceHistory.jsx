import { CalendarDays, Pencil, Plus, Trash2, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { formatCost, formatDate } from "@/lib/helpers";

export default function MaintenanceHistory({
  records = [],
  loading = false,
  onAddRecord,
  onEditRecord,
  onDeleteRecord,
}) {
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(a.service_date || 0).getTime();
    const dateB = new Date(b.service_date || 0).getTime();

    return dateB - dateA;
  });

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900">
            Maintenance History
          </CardTitle>

          <p className="mt-1 text-sm text-slate-500">
            View and manage your motorcycle service records.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          className="bg-slate-900 text-white hover:bg-slate-800"
          onClick={onAddRecord}
        >
          <Plus size={16} className="mr-1" />
          Add Maintenance
        </Button>

      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading maintenance records...
          </div>
        ) : sortedRecords.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-12 text-center">
            <CalendarDays size={32} className="mb-3 text-slate-400" />

            <p className="font-medium text-slate-700">
              No maintenance records yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add your first service record to get started.
            </p>

            <Button
              type="button"
              className="mt-4"
              onClick={onAddRecord}
            >
              <Plus size={16} className="mr-2" />
              Add First Record
            </Button>
          </div>
        ) : (
          <div>
            {sortedRecords.map((record, index) => (
              <div key={record.id}>
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <Wrench size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">
                      {record.service_type || "Maintenance"}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {record.brand && record.model
                        ? `${record.brand} ${record.model}`
                        : record.registration_number || "Motorcycle"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {record.registration_number || "No registration number"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(record.service_date)}
                      {" · "}
                      {Number(record.service_mileage || 0).toLocaleString(
                        "en-MY"
                      )}{" "}
                      km
                    </p>

                    {record.notes && (
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500">
                        {record.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <p className="font-semibold text-slate-900">
                      {formatCost(record.cost)}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEditRecord?.(record)}
                      >
                        <Pencil size={14} className="mr-1" />
                        Edit
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => onDeleteRecord?.(record)}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>

                {index < sortedRecords.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}