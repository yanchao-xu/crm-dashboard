import { useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Users,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OrgNode } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrgFilterProps {
  selectedOrg: OrgNode | null;
  onOrgChange: (org: OrgNode | null) => void;
  orgStructure: OrgNode;
  loading?: boolean;
}

const nodeIcons = {
  company: Building2,
  district: GraduationCap,
  team: Users,
  person: User,
};

const nodeColors = {
  company: "text-primary",
  district: "text-warning",
  team: "text-success",
  person: "text-muted-foreground",
};

interface OrgTreeItemProps {
  node: OrgNode;
  level: number;
  selectedId: string | null;
  onSelect: (node: OrgNode) => void;
}

function OrgTreeItem({ node, level, selectedId, onSelect }: OrgTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const { getText } = useLanguage();
  const hasChildren = node.children && node.children.length > 0;
  const Icon = nodeIcons[node.type];
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors text-sm",
          isSelected ? "bg-primary/20 text-primary" : "hover:bg-secondary/50",
        )}
        style={{ paddingLeft: level * 16 + 8 }}
        onClick={() => onSelect(node)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-secondary rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-4" />
        )}

        <Icon className={cn("w-3.5 h-3.5", nodeColors[node.type])} />
        <span className="truncate">{getText(node.name)}</span>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children?.map((child) => (
            <OrgTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OrgFilter({ selectedOrg, onOrgChange, orgStructure, loading }: OrgFilterProps) {
  const { t, getText } = useLanguage();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSelect = (node: OrgNode) => {
    onOrgChange(node);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOrgChange(null);
  };

  const Icon = selectedOrg ? nodeIcons[selectedOrg.type] : Building2;

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 gap-2 min-w-[180px] justify-start",
              selectedOrg && "border-primary bg-primary/10",
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4",
                selectedOrg
                  ? nodeColors[selectedOrg.type]
                  : "text-muted-foreground",
              )}
            />
            <span className="truncate flex-1 text-left">
              {selectedOrg ? getText(selectedOrg.name) : t("filter.allOrgs")}
            </span>
            {selectedOrg && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {t(`org.${selectedOrg.type}`)}
              </Badge>
            )}
            <ChevronDown className="w-4 h-4 ml-auto shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-2 bg-background" align="start">
          <div className="mb-2 pb-2 border-b border-border">
            <button
              onClick={() => {
                onOrgChange(null);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors text-sm",
                !selectedOrg
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-secondary/50",
              )}
            >
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{t("filter.allOrgs")}</span>
            </button>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <OrgTreeItem
              node={orgStructure}
              level={0}
              selectedId={selectedOrg?.id || null}
              onSelect={handleSelect}
            />
          </div>
        </PopoverContent>
      </Popover>

      {selectedOrg && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-9 px-2"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
