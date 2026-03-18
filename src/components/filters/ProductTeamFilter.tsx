import { useState } from "react";
import { Package, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";

export interface ProductGroup {
  id: string;
  name: { zh: string; en: string };
}

export interface TeamOption {
  id: string;
  name: { zh: string; en: string };
}

interface ProductTeamFilterProps {
  selectedProducts: string[];
  onProductsChange: (products: string[]) => void;
  productOptions: ProductGroup[];
}

function FilterPopover({
  label,
  icon: Icon,
  options,
  selectedValues,
  onSelectionChange,
  getText,
}: {
  label: string;
  icon: React.ElementType;
  options: { id: string; name: { zh: string; en: string } }[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  getText: (text: { zh: string; en: string }) => string;
}) {
  const [open, setOpen] = useState(false);

  const handleToggle = (id: string) => {
    if (selectedValues.includes(id)) {
      onSelectionChange(selectedValues.filter((v) => v !== id));
    } else {
      onSelectionChange([...selectedValues, id]);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-9 gap-1.5 ${selectedValues.length > 0 ? "border-primary bg-primary/10" : ""}`}
        >
          <Icon className="w-4 h-4" />
          {label}
          {selectedValues.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {selectedValues.length}
            </Badge>
          )}
          <ChevronDown className="w-3 h-3 ml-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-2 bg-popover border border-border"
        align="start"
      >
        <div className="space-y-1">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => handleToggle(option.id)}
              className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <Checkbox
                checked={selectedValues.includes(option.id)}
                className="w-4 h-4"
              />
              <span className="text-sm flex-1">{getText(option.name)}</span>
            </div>
          ))}
          {options.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No options available
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ProductTeamFilter({
  selectedProducts,
  onProductsChange,
  productOptions,
}: ProductTeamFilterProps) {
  const { t, getText } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <FilterPopover
        label={t("dashboard>filter>productGroup")}
        icon={Package}
        options={productOptions}
        selectedValues={selectedProducts}
        onSelectionChange={onProductsChange}
        getText={getText}
      />
    </div>
  );
}
