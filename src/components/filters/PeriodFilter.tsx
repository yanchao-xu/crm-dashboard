import { Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export type PeriodMode = "month" | "quarter";

interface PeriodFilterProps {
  value: PeriodMode;
  onChange: (mode: PeriodMode) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-1.5">
      <Calendar className="w-4 h-4 text-muted-foreground" />
      <Select value={value} onValueChange={(v) => onChange(v as PeriodMode)}>
        <SelectTrigger className="h-9 w-[120px] text-sm bot-dashboard-bg">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="month">{t("dashboard>filter>byMonth")}</SelectItem>
          <SelectItem value="quarter">
            {t("dashboard>filter>byQuarter")}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
