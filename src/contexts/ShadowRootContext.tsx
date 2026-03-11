import React, { createContext, useContext, useEffect, useState, useRef } from "react";

interface ShadowRootContextType {
    container: HTMLElement | null;
}

const ShadowRootContext = createContext<ShadowRootContextType>({
    container: null,
});

export const useShadowRoot = () => useContext(ShadowRootContext);

export function ShadowRootProvider({ children }: { children: React.ReactNode }) {
    const [container, setContainer] = useState<HTMLElement | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            const root = ref.current.getRootNode();
            if (root instanceof ShadowRoot) {
                // 在 Shadow DOM 中，使用 Shadow Root 作为容器
                setContainer(root as unknown as HTMLElement);
            } else {
                // 不在 Shadow DOM 中，使用 document.body
                setContainer(document.body);
            }
        }
    }, []);

    return (
        <ShadowRootContext.Provider value={{ container }}>
            <div ref={ref} style={{ display: 'contents' }}>
                {children}
            </div>
        </ShadowRootContext.Provider>
    );
}
