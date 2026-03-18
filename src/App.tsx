import { LanguageProvider } from "@/contexts/LanguageContext";
import { ApiProvider } from "@/contexts/ApiContext";
import { ShadowRootProvider } from "@/contexts/ShadowRootContext";
import type { RestApi } from "../icp-extension.types";
import "./App.css";
import Index from "./pages/Index";

interface AppProps {
  restApi?: RestApi | null;
  i18nApi?: any;
}

function App({ restApi = null, i18nApi = null }: AppProps) {
  return (
    <ShadowRootProvider>
      <ApiProvider restApi={restApi}>
        <LanguageProvider i18nApi={i18nApi}>
          <Index />
        </LanguageProvider>
      </ApiProvider>
    </ShadowRootProvider>
  );
}

export default App;
