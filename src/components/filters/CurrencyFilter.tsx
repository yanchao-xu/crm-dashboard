import { Coins } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export interface CurrencyOption {
    code: string;
    name: string;
}

interface CurrencyFilterProps {
    value: string;
    onChange: (currency: string) => void;
    options: CurrencyOption[];
    loading?: boolean;
}

export function CurrencyFilter({
    value,
    onChange,
    options,
    loading,
}: CurrencyFilterProps) {
    const { t } = useLanguage();

    return (
        <div className="flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-muted-foreground" />
            <Select value={value} onValueChange={onChange} disabled={loading}>
                <SelectTrigger className="h-9 w-[120px] text-sm bot-dashboard-bg">
                    <SelectValue placeholder={t("dashboard>filter>currency")} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.code} value={opt.code}>
                            {opt.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
