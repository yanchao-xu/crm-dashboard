import { LanguageProvider } from "@/contexts/LanguageContext";
import { ApiProvider } from "@/contexts/ApiContext";
import type { RestApi } from "../icp-extension.types";
import "./App.css";
import Index from "./pages/Index";

interface AppProps {
  restApi?: RestApi | null;
}

function App({ restApi = null }: AppProps) {
  return (
    <ApiProvider restApi={restApi}>
      <LanguageProvider>
        <Index />
      </LanguageProvider>
    </ApiProvider>
  );
}

export default App;
