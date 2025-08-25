import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/wizard/onboarding";
import Upload from "@/pages/wizard/upload";
import ExtractedData from "@/pages/wizard/extracted-data";
import TaxTips from "@/pages/wizard/tax-tips";
import ITRGeneration from "@/pages/wizard/itr-generation";

function Router() {
  const { user, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !user ? (
        <Route path="/" component={AuthPage} />
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
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
