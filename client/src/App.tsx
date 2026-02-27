import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Status from "./pages/Status";
import Docs from "./pages/Docs";
import Auth from "./pages/Auth";
import Demo from "./pages/Demo";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/demo"} component={Demo} />
      <Route path={"/docs"} component={Docs} />
      <Route path={"/status"} component={Status} />
      <Route path={"/login"} component={Auth} />
      <Route path={"/signup"} component={Auth} />
      <Route path={"/404"} component={NotFound} />
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
