import { DollarSign } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export type AmountMode = "expectedAmount" | "businessAmount";

interface AmountModeFilterProps {
    value: AmountMode;
    onChange: (mode: AmountMode) => void;
}

export function AmountModeFilter({ value, onChange }: AmountModeFilterProps) {
    const { t } = useLanguage();

    return (
        <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <Select value={value} onValueChange={(v) => onChange(v as AmountMode)}>
                <SelectTrigger className="h-9 w-[140px] text-sm bot-dashboard-bg">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="expectedAmount">
                        {t("dashboard>filter>expectedAmount")}
                    </SelectItem>
                    <SelectItem value="businessAmount">
                        {t("dashboard>filter>businessAmount")}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
