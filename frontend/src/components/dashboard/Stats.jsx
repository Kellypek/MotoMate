
import {
  ArrowDownRight,
  ArrowUpRight,
  Bike,
  CircleHelp,
  Clock3,
  Wrench,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function Stats({
  title,
  value,
  description,
  icon,
  trend,
  trendType = "neutral",
}) {
  const icons = {
    bike: Bike,
    wrench: Wrench,
    clock: Clock3,
    help: CircleHelp,
  };

  const Icon = icons[icon] || CircleHelp;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">
              {title}
            </p>

            <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </h3>
          </div>

          <div className="rounded-xl bg-cyan-50 p-3 text-cyan-700">
            <Icon size={21} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-xs">
          {trendType === "up" && (
            <ArrowUpRight size={15} className="text-emerald-600" />
          )}

          {trendType === "down" && (
            <ArrowDownRight size={15} className="text-red-600" />
          )}

          <span
            className={
              trendType === "up"
                ? "font-medium text-emerald-600"
                : trendType === "down"
                  ? "font-medium text-red-600"
                  : "text-slate-500"
            }
          >
            {trend}
          </span>

          {description && (
            <span className="text-slate-400">
              {description}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
