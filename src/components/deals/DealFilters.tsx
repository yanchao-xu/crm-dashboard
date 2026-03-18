import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
export interface FilterState {
  stages: string[];
  owners: string[];
  activityStatus: string[];
  probabilityRange: [number, number];
  valueRange: [number, number];
  searchQuery: string;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface DealFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  stageOptions: FilterOption[];
  ownerOptions: FilterOption[];
}

const getActivityStatusOptions = (
  t: (key: string) => string,
): FilterOption[] => [
  { value: "active", label: t("dashboard>filter>activeRange") },
  { value: "over30", label: t("dashboard>filter>stagnantRange") },
  { value: "over60", label: t("dashboard>filter>riskRange") },
  { value: "zombie", label: t("dashboard>filter>zombieRange") },
];

const probabilityRanges: FilterOption[] = [
  { value: "0-25", label: "0-25%" },
  { value: "26-50", label: "26-50%" },
  { value: "51-75", label: "51-75%" },
  { value: "76-100", label: "76-100%" },
];

function FilterPopover({
  label,
  icon: Icon,
  options,
  selectedValues,
  onSelectionChange,
  isMulti = true,
}: {
  label: string;
  icon: React.ElementType;
  options: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  isMulti?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const handleToggle = (value: string) => {
    if (isMulti) {
      if (selectedValues.includes(value)) {
        onSelectionChange(selectedValues.filter((v) => v !== value));
      } else {
        onSelectionChange([...selectedValues, value]);
      }
    } else {
      onSelectionChange(selectedValues.includes(value) ? [] : [value]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 gap-1.5 ${selectedValues.length > 0 ? "border-primary bg-primary/10" : ""}`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
          {selectedValues.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {selectedValues.length}
            </Badge>
          )}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-1">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleToggle(option.value)}
              className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <Checkbox
                checked={selectedValues.includes(option.value)}
                className="w-4 h-4"
              />
              <span className="text-sm flex-1">{option.label}</span>
              {option.count !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {option.count}
                </span>
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DealFilters({
  filters,
  onFiltersChange,
  stageOptions,
  ownerOptions,
}: DealFiltersProps) {
  const { t } = useLanguage();
  const activityStatusOptions = getActivityStatusOptions(t);

  const activeFilterCount =
    filters.stages.length +
    filters.owners.length +
    filters.activityStatus.length +
    (filters.searchQuery ? 1 : 0);

  const clearAllFilters = () => {
    onFiltersChange({
      stages: [],
      owners: [],
      activityStatus: [],
      probabilityRange: [0, 100],
      valueRange: [0, 1000000],
      searchQuery: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 p-4 border-b border-border bg-secondary/20"
    >
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-[300px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t("dashboard>filter>searchPlaceholder")}
          value={filters.searchQuery}
          onChange={(e) =>
            onFiltersChange({ ...filters, searchQuery: e.target.value })
          }
          className="h-8 pl-8 text-sm bg-background"
        />
      </div>

      {/* Stage Filter */}
      <FilterPopover
        label={t("dashboard>filter>stage")}
        icon={Filter}
        options={stageOptions}
        selectedValues={filters.stages}
        onSelectionChange={(stages) => onFiltersChange({ ...filters, stages })}
      />

      {/* Owner Filter */}
      <FilterPopover
        label={t("dashboard>filter>owner")}
        icon={Filter}
        options={ownerOptions}
        selectedValues={filters.owners}
        onSelectionChange={(owners) => onFiltersChange({ ...filters, owners })}
      />

      {/* Activity Status Filter */}
      <FilterPopover
        label={t("dashboard>filter>activity")}
        icon={Filter}
        options={activityStatusOptions}
        selectedValues={filters.activityStatus}
        onSelectionChange={(activityStatus) =>
          onFiltersChange({ ...filters, activityStatus })
        }
      />

      {/* Probability Filter */}
      <FilterPopover
        label={t("dashboard>filter>probability")}
        icon={Filter}
        options={probabilityRanges}
        selectedValues={
          filters.probabilityRange[0] === 0 &&
          filters.probabilityRange[1] === 100
            ? []
            : [`${filters.probabilityRange[0]}-${filters.probabilityRange[1]}`]
        }
        onSelectionChange={(values) => {
          if (values.length === 0) {
            onFiltersChange({ ...filters, probabilityRange: [0, 100] });
          } else {
            const [min, max] = values[values.length - 1].split("-").map(Number);
            onFiltersChange({ ...filters, probabilityRange: [min, max] });
          }
        }}
        isMulti={false}
      />

      {/* Clear All */}
      <AnimatePresence>
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              {t("dashboard>filter>clear")} ({activeFilterCount})
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
