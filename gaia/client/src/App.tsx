import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Characters from "./pages/Characters";
import Factions from "./pages/Factions";
import Locations from "./pages/Locations";
import Timeline from "./pages/Timeline";
import Concepts from "./pages/Concepts";
import Admin from "./pages/Admin";
import GaiaLayout from "./components/GaiaLayout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/characters" component={Characters} />
      <Route path="/factions" component={Factions} />
      <Route path="/locations" component={Locations} />
      <Route path="/timeline" component={Timeline} />
      <Route path="/concepts" component={Concepts} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <GaiaLayout>
            <Router />
          </GaiaLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
