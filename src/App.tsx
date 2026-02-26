import { LanguageProvider } from "@/contexts/LanguageContext";
import "./App.css";
import Index from "./pages/Index";

function App() {
  return (
    <LanguageProvider>
      <Index />
    </LanguageProvider>
  );
}

export default App;
