import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import TaxBot from "@/components/chatbot/taxbot";
import type { TaxSession, User } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [financialYear] = useState("2023-24");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  // Fetch existing tax session (latest one)
  const { data: taxSession, isLoading: sessionLoading } = useQuery<TaxSession>({
    queryKey: ["/api/tax-sessions/user", financialYear],
    enabled: isAuthenticated,
    retry: false,
  });

  // Fetch all tax sessions for the user
  const { data: allSessions, isLoading: allSessionsLoading } = useQuery<TaxSession[]>({
    queryKey: ["/api/tax-sessions/user/all", financialYear],
    enabled: isAuthenticated,
    retry: false,
  });

  // Create new tax session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (forceNew = false) => {
      const url = forceNew ? "/api/tax-sessions?forceNew=true" : "/api/tax-sessions";
      const response = await apiRequest("POST", url, {
        financialYear,
        onboardingData: null,
      });
      return response.json();
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax-sessions/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tax-sessions/user/all"] });
      setLocation(`/wizard/onboarding/${session.id}`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create tax session",
        variant: "destructive",
      });
    },
  });

  const handleContinueSession = (session?: TaxSession) => {
    const sessionToUse = session || taxSession;
    if (sessionToUse) {
      // Resume existing session
      const step = sessionToUse.currentStep || 1;
      if (step === 1) {
        setLocation(`/wizard/onboarding/${sessionToUse.id}`);
      } else if (step <= 3) {
        setLocation(`/wizard/upload/${sessionToUse.id}`);
      } else if (step <= 5) {
        setLocation(`/wizard/review/${sessionToUse.id}`);
      } else if (step <= 7) {
        setLocation(`/wizard/tips/${sessionToUse.id}`);
      } else {
        setLocation(`/wizard/itr/${sessionToUse.id}`);
      }
    }
  };

  const handleStartNewFiling = () => {
    createSessionMutation.mutate(true); // Force new session
  };

  const handleStartFiling = () => {
    if (taxSession) {
      handleContinueSession();
    } else {
      createSessionMutation.mutate(false);
    }
  };

  const getProgressPercentage = () => {
    if (!taxSession) return 0;
    return Math.min(((taxSession.currentStep || 1) / 9) * 100, 100);
  };

  const getStepStatus = (step: number) => {
    if (!taxSession) return "pending";
    const currentStep = taxSession.currentStep || 1;
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "pending";
  };

  const steps = [
    { number: 1, title: "Login", description: "Authentication completed" },
    { number: 2, title: "Q&A", description: "Personal information" },
    { number: 3, title: "Upload", description: "Form 16 upload" },
    { number: 4, title: "Extract", description: "AI data extraction" },
    { number: 5, title: "Review", description: "Verify extracted data" },
    { number: 6, title: "Tax Tips", description: "Investment suggestions" },
    { number: 7, title: "ITR-1", description: "Form generation" },
    { number: 8, title: "Download", description: "Get JSON file" },
    { number: 9, title: "Complete", description: "Filing complete" },
  ];

  if (authLoading || sessionLoading || allSessionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <i className="fas fa-calculator text-primary text-2xl"></i>
              <span className="text-xl font-bold text-gray-900">EZTaxMate</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <i className="fas fa-calendar"></i>
                <span>FY {financialYear}</span>
              </div>
              <Button variant="outline" onClick={() => window.location.href = '/api/logout'} data-testid="button-logout">
                <i className="fas fa-sign-out-alt mr-2"></i>Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="welcome-title">
            Welcome back, {user?.firstName || 'there'}! 👋
          </h1>
          {taxSession ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-600">Tax filing progress for FY {financialYear}</p>
                  <span className="text-sm text-gray-500">
                    {taxSession.currentStep || 1} of 9 steps completed
                  </span>
                </div>
                <Progress value={getProgressPercentage()} className="h-3" data-testid="progress-bar" />
              </div>
              <p className="text-sm text-gray-600" data-testid="progress-estimate">
                Est. {Math.max(1, 15 - ((taxSession.currentStep || 1) * 2))} minutes remaining
              </p>
            </div>
          ) : (
            <p className="text-gray-600">Ready to start your tax filing journey?</p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {taxSession ? (
                    <>
                      <i className="fas fa-play-circle text-primary"></i>
                      <span>Continue Filing</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-rocket text-primary"></i>
                      <span>Start Tax Filing</span>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {taxSession ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        Current Step: {steps.find(s => s.number === (taxSession.currentStep || 1))?.title}
                      </h3>
                      <p className="text-blue-800 text-sm">
                        {steps.find(s => s.number === (taxSession.currentStep || 1))?.description}
                      </p>
                    </div>
                    <Button onClick={handleStartFiling} disabled={createSessionMutation.isPending} className="w-full" data-testid="button-continue-filing">
                      {createSessionMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Loading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-arrow-right mr-2"></i>
                          Continue Where You Left Off
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Get started with your ITR-1 filing for FY {financialYear}. Our AI-powered system will guide you through each step.
                    </p>
                    <Button onClick={handleStartFiling} disabled={createSessionMutation.isPending} className="w-full" data-testid="button-start-filing">
                      {createSessionMutation.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Creating Session...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-play mr-2"></i>
                          Start New Filing
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Management */}
            {allSessions && allSessions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <i className="fas fa-history text-primary"></i>
                    <span>Filing Sessions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-3">
                      {allSessions.slice(0, 3).map((session, index) => (
                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant={session.isCompleted ? "default" : "secondary"}>
                                {session.isCompleted ? "Completed" : `Step ${session.currentStep || 1}/9`}
                              </Badge>
                              {index === 0 && <Badge variant="outline">Latest</Badge>}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Created: {new Date(session.createdAt!).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContinueSession(session)}
                            disabled={createSessionMutation.isPending}
                            data-testid={`button-continue-session-${session.id}`}
                          >
                            {session.isCompleted ? "View" : "Continue"}
                          </Button>
                        </div>
                      ))}
                    </div>
                    {allSessions.length > 1 && (
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          onClick={handleStartNewFiling}
                          disabled={createSessionMutation.isPending}
                          className="flex-1"
                          data-testid="button-start-new-filing"
                        >
                          <i className="fas fa-plus mr-2"></i>
                          Start Fresh Filing
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Steps Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Filing Process Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {steps.map((step, index) => {
                    const status = getStepStatus(step.number);
                    return (
                      <div key={step.number} className="flex items-start space-x-3" data-testid={`step-overview-${step.number}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          status === 'completed' ? 'bg-green-500 text-white' :
                          status === 'current' ? 'bg-primary text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {status === 'completed' ? <i className="fas fa-check text-xs"></i> : step.number}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{step.title}</h4>
                          <p className="text-xs text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            {taxSession?.extractedData && (
              <Card data-testid="card-tax-summary">
                <CardHeader>
                  <CardTitle>Your Tax Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Gross Salary</span>
                    <span className="font-medium">₹{(taxSession.extractedData as any).grossSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">TDS Paid</span>
                    <span className="font-medium">₹{(taxSession.extractedData as any).tdsDeducted?.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-900 font-medium">Expected Refund</span>
                    <span className="font-bold text-green-600">₹12,400</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>Why Choose EZTaxMate?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-robot text-primary"></i>
                  <span className="text-sm">AI-powered data extraction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-graduation-cap text-secondary"></i>
                  <span className="text-sm">Beginner-friendly explanations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-piggy-bank text-accent"></i>
                  <span className="text-sm">Smart tax-saving tips</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-shield-alt text-green-600"></i>
                  <span className="text-sm">Bank-level security</span>
                </div>
              </CardContent>
            </Card>

            {/* TaxBot */}
            <TaxBot />
          </div>
        </div>
      </div>
    </div>
  );
}
