
import { Badge } from "@/components/ui/badge";
import { normalizeStatus } from "@/lib/helpers";

export default function Status({ status }) {
  const normalizedStatus = normalizeStatus(status);

  const styles = {
    Overdue: "bg-red-50 text-red-700 border-red-200",
    "Due Soon": "bg-amber-50 text-amber-700 border-amber-200",
    OK: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Unknown: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <Badge
      variant="outline"
      className={styles[normalizedStatus]}
    >
      {normalizedStatus}
    </Badge>
  );
}
