import { createContext, useContext, ReactNode } from "react";

interface CurrencyContextType {
    /** 当前选中的币种 code，如 "CNY", "USD", "JPY" */
    currencyCode: string;
}

const CurrencyContext = createContext<CurrencyContextType>({
    currencyCode: "",
});

interface CurrencyProviderProps {
    currencyCode: string;
    children: ReactNode;
}

export function CurrencyProvider({ currencyCode, children }: CurrencyProviderProps) {
    return (
        <CurrencyContext.Provider value={{ currencyCode }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    return useContext(CurrencyContext);
}
