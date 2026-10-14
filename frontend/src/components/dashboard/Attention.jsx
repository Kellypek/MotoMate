
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";

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

export default function Attention({
  records = [],
  loading = false,
  failedBikeIds = [],
  setActivePage,
}) {
  const attentionRecords = records
    .map((record) => {
      const remainingKm = getRecordRemainingKm(record);
      const status = normalizeStatus(record.status);

      let calculatedStatus = status;

      if (remainingKm !== null) {
        if (remainingKm <= 0) {
          calculatedStatus = "Overdue";
        } else if (remainingKm <= 500) {
          calculatedStatus = "Due Soon";
        } else {
          calculatedStatus = "OK";
        }
      }

      return {
        ...record,
        remainingKm,
        calculatedStatus,
      };
    })
    .filter(
      (record) =>
        record.calculatedStatus === "Overdue" ||
        record.calculatedStatus === "Due Soon"
    )
    .sort((a, b) => a.remainingKm - b.remainingKm)
    .slice(0, 4);

  const hasFailedStatuses = failedBikeIds.length > 0;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900">
            Service Attention
          </CardTitle>

          <p className="mt-1 text-sm text-slate-500">
            Maintenance that may need your attention
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
          <AlertTriangle size={20} />
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        {loading ? (
          <p className="p-6 text-center text-sm text-slate-500">
            Loading service information...
          </p>
        ) : attentionRecords.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-8 text-center">
            {hasFailedStatuses ? (
              <>
                <AlertTriangle size={28} className="mb-3 text-amber-500" />
                <p className="font-medium text-slate-700">
                  Some service statuses are unavailable
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Check your connection and try again.
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 size={30} className="mb-3 text-emerald-500" />
                <p className="font-medium text-slate-700">
                  No urgent services found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  No overdue or upcoming services were found in the loaded records.
                </p>
              </>
            )}
          </div>
        ) : (
          <div>
            {attentionRecords.map((record, index) => {
              const isOverdue = record.calculatedStatus === "Overdue";

              return (
                <div key={record.id}>
                  <div className="flex items-start gap-3 p-4">
                    <div
                      className={`mt-0.5 rounded-lg p-2 ${
                        isOverdue
                          ? "bg-red-50 text-red-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {isOverdue ? (
                        <AlertTriangle size={18} />
                      ) : (
                        <Clock3 size={18} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800">
                        {record.brand} {record.model}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {record.service_type || "Maintenance"}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {isOverdue
                          ? `${formatMileage(Math.abs(record.remainingKm))} past due`
                          : `${formatMileage(record.remainingKm)} remaining`}
                      </p>
                    </div>

                    <Status status={record.calculatedStatus} />
                  </div>

                  {index < attentionRecords.length - 1 && <Separator />}
                </div>
              );
            })}
          </div>
        )}

        <Separator />

        <div className="p-4">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-between text-sm text-slate-600 hover:text-slate-900"
            onClick={() => setActivePage?.("Service Schedule")}
          >
            View service schedule
            <ArrowRight size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
