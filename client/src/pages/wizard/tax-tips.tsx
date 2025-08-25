import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProgressBar from "@/components/wizard/progress-bar";
import StepNavigation from "@/components/wizard/step-navigation";
import ExplainerModal from "@/components/modals/explainer-modal";
import type { TaxSession } from "@shared/schema";

interface TaxTipsProps {
  params: { sessionId: string };
}

export default function TaxTips({ params }: TaxTipsProps) {
  const { sessionId } = params;
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [appliedSuggestions, setAppliedSuggestions] = useState<Record<string, number>>({});
  const [showExplainer, setShowExplainer] = useState(false);
  const [explainerContent, setExplainerContent] = useState({ title: "", content: "" });

  // Show loading while auth is loading
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Fetch tax session
  const { data: taxSession, isLoading: sessionLoading } = useQuery<TaxSession>({
    queryKey: ["/api/tax-sessions", sessionId],
    enabled: !!user,
    retry: false,
  });

  // Generate tax suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/tax-suggestions", sessionId],
    queryFn: async () => {
      const response = await apiRequest("POST", "/api/tax-suggestions", {
        taxSessionId: sessionId,
      });
      return response.json();
    },
    enabled: isAuthenticated && !!taxSession,
    retry: false,
  });

  // Apply suggestions mutation
  const applySuggestionsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("PUT", `/api/tax-sessions/${sessionId}`, {
        currentStep: 7,
        appliedSuggestions,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax-sessions", sessionId] });
      setLocation(`/wizard/itr/${sessionId}`);
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
        description: "Failed to apply suggestions",
        variant: "destructive",
      });
    },
  });

  const handleAddSuggestion = (suggestionKey: string, amount: number) => {
    setAppliedSuggestions(prev => ({
      ...prev,
      [suggestionKey]: amount,
    }));
  };

  const handleRemoveSuggestion = (suggestionKey: string) => {
    setAppliedSuggestions(prev => {
      const { [suggestionKey]: removed, ...rest } = prev;
      return rest;
    });
  };

  const getTotalTaxSaving = () => {
    if (!suggestions) return 0;
    return Object.keys(appliedSuggestions).reduce((total, key) => {
      const suggestion = suggestions[key];
      return total + (suggestion?.taxSaving || 0);
    }, 0);
  };

  const handleExplainer = (type: string) => {
    const explainers = {
      elss: {
        title: "ELSS Mutual Funds - Explained Simply 🎯",
        content: `
          <div class="space-y-4">
            <p><strong>Think of ELSS like a magic investment box! 📦✨</strong></p>
            <p>ELSS = Equity Linked Savings Scheme</p>
            <div class="bg-blue-50 p-3 rounded-lg space-y-2">
              <p><strong>How it works:</strong></p>
              <ul class="list-disc list-inside text-sm space-y-1">
                <li>You invest money in companies through mutual funds</li>
                <li>Your money grows over time (historically 12-15% per year)</li>
                <li>You save tax up to ₹46,800 per year</li>
                <li>Money is locked for 3 years (shortest among 80C options)</li>
              </ul>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <p><strong>Example:</strong> Invest ₹1,50,000 → Save ₹46,800 in tax + Potential growth of ₹22,500 in 3 years!</p>
            </div>
          </div>
        `
      },
      healthInsurance: {
        title: "Health Insurance - Double Benefit! 🏥💰",
        content: `
          <div class="space-y-4">
            <p><strong>Health insurance gives you TWO benefits in one! 🎭</strong></p>
            <div class="bg-blue-50 p-3 rounded-lg space-y-2">
              <p><strong>Benefit 1: Health Protection</strong></p>
              <ul class="list-disc list-inside text-sm space-y-1">
                <li>Covers medical expenses up to ₹25,000</li>
                <li>Protects your savings from hospital bills</li>
                <li>Cashless treatment at network hospitals</li>
              </ul>
            </div>
            <div class="bg-green-50 p-3 rounded-lg space-y-2">
              <p><strong>Benefit 2: Tax Savings</strong></p>
              <ul class="list-disc list-inside text-sm space-y-1">
                <li>Save up to ₹7,800 in tax (for ₹25,000 premium)</li>
                <li>Additional deduction under Section 80D</li>
                <li>Separate from 80C limit</li>
              </ul>
            </div>
          </div>
        `
      },
      nps: {
        title: "National Pension Scheme - Retirement Planning 🏦",
        content: `
          <div class="space-y-4">
            <p><strong>NPS is like building a retirement treasure chest! 💎</strong></p>
            <p>National Pension Scheme = Government-backed retirement savings</p>
            <div class="bg-blue-50 p-3 rounded-lg space-y-2">
              <p><strong>How it helps:</strong></p>
              <ul class="list-disc list-inside text-sm space-y-1">
                <li>Additional ₹50,000 tax deduction under 80CCD(1B)</li>
                <li>Separate from 80C limit (so you can claim both!)</li>
                <li>Government co-contribution in some cases</li>
                <li>Professional fund management</li>
              </ul>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <p><strong>Best part:</strong> Save ₹15,600 extra in tax + build retirement corpus!</p>
            </div>
          </div>
        `
      }
    };

    const explainer = explainers[type as keyof typeof explainers];
    if (explainer) {
      setExplainerContent(explainer);
      setShowExplainer(true);
    }
  };

  if (authLoading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!taxSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-bold text-red-600 mb-2">Session Not Found</h1>
            <p className="text-gray-600 mb-4">The tax session could not be found.</p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-dashboard">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
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
            <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-dashboard">
              <i className="fas fa-home mr-2"></i>Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar currentStep={6} totalSteps={9} />
        </div>

        {/* Step Navigation */}
        <div className="mb-8">
          <StepNavigation currentStep={6} />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <i className="fas fa-lightbulb text-white"></i>
                  </div>
                  <span>Smart Tax-Saving Suggestions 💡</span>
                </CardTitle>
                <p className="text-gray-700">
                  Based on your salary, here are personalized investment tips to save more tax:
                </p>
              </CardHeader>
              <CardContent>
                {suggestionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Generating personalized suggestions...</p>
                  </div>
                ) : suggestions ? (
                  <div className="space-y-4">
                    {/* ELSS Suggestion */}
                    <Card className="bg-white border border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">80C</Badge>
                              <h3 className="font-semibold text-gray-900">ELSS Mutual Funds</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{suggestions.elss?.description}</p>
                            <div className="flex items-center space-x-4 mb-2">
                              <span className="text-green-600 font-medium">
                                Potential Tax Saving: ₹{Math.round(suggestions.elss?.taxSaving || 0).toLocaleString()}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExplainer('elss')}
                                className="text-primary hover:underline text-sm"
                                data-testid="button-explain-elss"
                              >
                                <i className="fas fa-info-circle mr-1"></i>Explain like I'm 5
                              </Button>
                            </div>
                          </div>
                          {appliedSuggestions.elss ? (
                            <Button
                              variant="outline"
                              onClick={() => handleRemoveSuggestion('elss')}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              data-testid="button-remove-elss"
                            >
                              <i className="fas fa-times mr-2"></i>Remove
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleAddSuggestion('elss', suggestions.elss?.maxInvestment - suggestions.elss?.currentInvestment)}
                              data-testid="button-add-elss"
                            >
                              Add to Plan
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Health Insurance Suggestion */}
                    <Card className="bg-white border border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary" className="bg-purple-100 text-purple-800">80D</Badge>
                              <h3 className="font-semibold text-gray-900">Health Insurance</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{suggestions.healthInsurance?.description}</p>
                            <div className="flex items-center space-x-4 mb-2">
                              <span className="text-green-600 font-medium">
                                Potential Tax Saving: ₹{Math.round(suggestions.healthInsurance?.taxSaving || 0).toLocaleString()}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExplainer('healthInsurance')}
                                className="text-primary hover:underline text-sm"
                                data-testid="button-explain-health-insurance"
                              >
                                <i className="fas fa-info-circle mr-1"></i>Explain like I'm 5
                              </Button>
                            </div>
                          </div>
                          {appliedSuggestions.healthInsurance ? (
                            <Button
                              variant="outline"
                              onClick={() => handleRemoveSuggestion('healthInsurance')}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              data-testid="button-remove-health-insurance"
                            >
                              <i className="fas fa-times mr-2"></i>Remove
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleAddSuggestion('healthInsurance', suggestions.healthInsurance?.maxInvestment)}
                              data-testid="button-add-health-insurance"
                            >
                              Add to Plan
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* NPS Suggestion */}
                    <Card className="bg-white border border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">NPS</Badge>
                              <h3 className="font-semibold text-gray-900">National Pension Scheme</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{suggestions.nps?.description}</p>
                            <div className="flex items-center space-x-4 mb-2">
                              <span className="text-green-600 font-medium">
                                Potential Tax Saving: ₹{Math.round(suggestions.nps?.taxSaving || 0).toLocaleString()}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExplainer('nps')}
                                className="text-primary hover:underline text-sm"
                                data-testid="button-explain-nps"
                              >
                                <i className="fas fa-info-circle mr-1"></i>Explain like I'm 5
                              </Button>
                            </div>
                          </div>
                          {appliedSuggestions.nps ? (
                            <Button
                              variant="outline"
                              onClick={() => handleRemoveSuggestion('nps')}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              data-testid="button-remove-nps"
                            >
                              <i className="fas fa-times mr-2"></i>Remove
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleAddSuggestion('nps', suggestions.nps?.maxInvestment)}
                              data-testid="button-add-nps"
                            >
                              Add to Plan
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold mb-1">Total Potential Tax Savings</h3>
                            <p className="text-green-100 text-sm">By implementing selected suggestions</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">₹{Math.round(getTotalTaxSaving()).toLocaleString()}</div>
                            <div className="text-green-100 text-sm">Per year</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <Button
                        onClick={() => applySuggestionsMutation.mutate()}
                        disabled={applySuggestionsMutation.isPending}
                        className="flex-1"
                        data-testid="button-apply-continue"
                      >
                        {applySuggestionsMutation.isPending ? (
                          <>
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                            Applying...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-arrow-right mr-2"></i>
                            Apply Suggestions & Continue
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setLocation(`/wizard/itr/${sessionId}`)}
                        className="flex-1"
                        data-testid="button-skip"
                      >
                        Skip for Now
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Failed to load suggestions. Please try again.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            {taxSession?.extractedData && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <CardHeader>
                  <CardTitle>Your Tax Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Gross Salary</span>
                    <span className="font-medium">₹{(taxSession.extractedData as any).grossSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Current Deductions</span>
                    <span className="font-medium">₹{(taxSession.extractedData as any).deductions?.["80C"]?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm">Tax Paid (TDS)</span>
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

            {/* Applied Suggestions */}
            {Object.keys(appliedSuggestions).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Applied Suggestions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(appliedSuggestions).map(([key, amount]) => (
                    <div key={key} className="flex items-center justify-between" data-testid={`applied-suggestion-${key}`}>
                      <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-sm font-medium">₹{amount.toLocaleString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                    <i className="fas fa-clock text-white text-xs"></i>
                  </div>
                  <span>Generate ITR-1 form</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <span>Review final calculations</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                  <span>Download JSON file</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Explainer Modal */}
      <ExplainerModal
        isOpen={showExplainer}
        onClose={() => setShowExplainer(false)}
        title={explainerContent.title}
        content={explainerContent.content}
      />
    </div>
  );
}
