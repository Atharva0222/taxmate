import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/wizard/onboarding";
import Upload from "@/pages/wizard/upload";
import ExtractedData from "@/pages/wizard/extracted-data";
import TaxTips from "@/pages/wizard/tax-tips";
import ITRGeneration from "@/pages/wizard/itr-generation";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/wizard/onboarding/:sessionId" component={Onboarding} />
          <Route path="/wizard/upload/:sessionId" component={Upload} />
          <Route path="/wizard/review/:sessionId" component={ExtractedData} />
          <Route path="/wizard/tips/:sessionId" component={TaxTips} />
          <Route path="/wizard/itr/:sessionId" component={ITRGeneration} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
