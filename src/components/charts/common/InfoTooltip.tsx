import { useState } from "react";
import { Info } from "lucide-react";

interface InfoTooltipProps {
    /** 提示文本，支持 \n 换行 */
    text: string;
    /** 浮层宽度 class，默认 w-64 */
    width?: string;
}

/**
 * 通用 hover 信息提示组件
 * 行为与 ChartCard titleTooltip 一致：hover 显示，移开消失
 */
export function InfoTooltip({ text, width = "w-64" }: InfoTooltipProps) {
    const [show, setShow] = useState(false);

    // 将字面 \n 转为真正换行符
    const displayText = text.replace(/\\n/g, "\n");

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            <Info className="w-3 h-3 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
            {show && (
                <div
                    className={`absolute left-0 top-full mt-2 z-50 ${width} p-2.5 rounded-lg bg-popover border border-border shadow-lg text-xs text-popover-foreground whitespace-pre-line`}
                >
                    {displayText}
                </div>
            )}
        </div>
    );
}
