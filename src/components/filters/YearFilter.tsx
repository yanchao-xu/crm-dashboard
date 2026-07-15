import { useState, useMemo, useRef, useEffect } from "react";
import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface YearFilterProps {
    value: number;
    onChange: (year: number) => void;
}

// 生成 2016 前后 20 年的选项列表：1996 ~ 2036
const BASE_YEAR = 2016;
const YEAR_RANGE = 20;
const ALL_YEARS: number[] = [];
for (let y = BASE_YEAR - YEAR_RANGE; y <= BASE_YEAR + YEAR_RANGE; y++) {
    ALL_YEARS.push(y);
}

export function YearFilter({ value, onChange }: YearFilterProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const listRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLDivElement>(null);

    const filteredYears = useMemo(() => {
        if (!search.trim()) return ALL_YEARS;
        return ALL_YEARS.filter((y) => String(y).includes(search.trim()));
    }, [search]);

    // 打开时滚动到选中年份
    useEffect(() => {
        if (open) {
            setSearch("");
            // 延迟一帧让 DOM 渲染完再滚动
            requestAnimationFrame(() => {
                selectedRef.current?.scrollIntoView({ block: "center" });
            });
        }
    }, [open]);

    return (
        <div className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        className={cn(
                            "flex h-9 w-[90px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        )}
                    >
                        <span>{value}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-[140px] p-2" align="start">
                    <Input
                        placeholder="搜索年份..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-8 text-sm mb-2"
                    />
                    <div
                        ref={listRef}
                        className="max-h-[240px] overflow-y-auto"
                    >
                        {filteredYears.map((year) => (
                            <div
                                key={year}
                                ref={year === value ? selectedRef : undefined}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    year === value && "bg-accent text-accent-foreground font-medium",
                                )}
                                onClick={() => {
                                    onChange(year);
                                    setOpen(false);
                                }}
                            >
                                {year === value && <Check className="h-3.5 w-3.5" />}
                                {year !== value && <span className="w-3.5" />}
                                {year}
                            </div>
                        ))}
                        {filteredYears.length === 0 && (
                            <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                                无匹配年份
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
