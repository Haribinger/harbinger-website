import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Home = lazy(() => import("./pages/Home"));
const Demo = lazy(() => import("./pages/Demo"));
const Scan = lazy(() => import("./pages/Scan"));
const Docs = lazy(() => import("./pages/Docs"));
const Status = lazy(() => import("./pages/Status"));
const Auth = lazy(() => import("./pages/Auth"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const ScanResults = lazy(() => import("./pages/ScanResults"));
const MissionControl = lazy(() => import("./pages/MissionControl"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#00d4ff]/30 border-t-[#00d4ff] rounded-full animate-spin" />
        <span className="text-xs font-mono text-[#555]">Loading...</span>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/demo"} component={Demo} />
        <Route path={"/scan"} component={Scan} />
        <Route path={"/docs"} component={Docs} />
        <Route path={"/status"} component={Status} />
        <Route path={"/pricing"} component={Pricing} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/settings"} component={Settings} />
        <Route path={"/scan/:id"} component={ScanResults} />
        <Route path={"/mission-control"} component={MissionControl} />
        <Route path={"/login"} component={Auth} />
        <Route path={"/signup"} component={Auth} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
