
import { ArrowRight, CalendarDays, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  formatCost,
  formatDate,
} from "@/lib/helpers";

export default function History({
  records = [],
  loading = false,
  setActivePage,
}) {
  const recentRecords = [...records]
    .sort((a, b) => {
      const dateA = new Date(a.service_date || 0).getTime();
      const dateB = new Date(b.service_date || 0).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900">
            Recent Maintenance
          </CardTitle>

          <p className="mt-1 text-sm text-slate-500">
            Your latest service records
          </p>
        </div>

        <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
          <CalendarDays size={20} />
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading maintenance records...
          </div>
        ) : recentRecords.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-10 text-center">
            <Wrench size={30} className="mb-3 text-slate-400" />

            <p className="font-medium text-slate-700">
              No maintenance records yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Your maintenance history will appear here after you add a record.
            </p>
          </div>
        ) : (
          <div>
            {recentRecords.map((record, index) => (
              <div key={record.id}>
                <div className="flex items-start gap-3 p-4 sm:items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Wrench size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">
                      {record.service_type || "Maintenance"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {record.brand && record.model
                        ? `${record.brand} ${record.model}`
                        : record.registration_number || "Motorcycle"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDate(record.service_date)}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-800">
                      {formatCost(record.cost)}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {Number(record.service_mileage).toLocaleString("en-MY")} km
                    </p>
                  </div>
                </div>

                {index < recentRecords.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="p-4">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between text-sm text-slate-600 hover:text-slate-900"
            onClick={() => setActivePage?.("Maintenance History")}
          >
            View all maintenance records
            <ArrowRight size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
