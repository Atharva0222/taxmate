import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import ProgressBar from "@/components/wizard/progress-bar";
import StepNavigation from "@/components/wizard/step-navigation";
import type { TaxSession } from "@shared/schema";

interface OnboardingProps {
  params: { sessionId: string };
}

export default function Onboarding({ params }: OnboardingProps) {
  const { sessionId } = params;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    age: "",
    experience: "",
    salary: "",
    goals: "",
    investmentExperience: "",
    riskTolerance: "",
  });

  // Redirect if not authenticated
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

  // Fetch tax session
  const { data: taxSession, isLoading: sessionLoading } = useQuery<TaxSession>({
    queryKey: ["/api/tax-sessions", sessionId],
    enabled: isAuthenticated,
    retry: false,
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async (onboardingData: any) => {
      const response = await apiRequest("PUT", `/api/tax-sessions/${sessionId}`, {
        currentStep: 3,
        onboardingData,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tax-sessions", sessionId] });
      setLocation(`/wizard/upload/${sessionId}`);
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
        description: "Failed to save information",
        variant: "destructive",
      });
    },
  });

  // Initialize form with existing data
  useEffect(() => {
    if (taxSession?.onboardingData) {
      setFormData(taxSession.onboardingData as any);
    }
  }, [taxSession]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.age || !formData.experience || !formData.salary) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    updateSessionMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar currentStep={2} totalSteps={9} />
        </div>

        {/* Step Navigation */}
        <div className="mb-8">
          <StepNavigation currentStep={2} />
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-user-friends text-primary"></i>
              <span>Tell Us About Yourself 👋</span>
            </CardTitle>
            <p className="text-gray-600">
              This helps us provide personalized tax-saving suggestions just for you
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Age */}
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    required
                    data-testid="input-age"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="experience">Work Experience *</Label>
                  <RadioGroup
                    value={formData.experience}
                    onValueChange={(value) => handleInputChange("experience", value)}
                    className="flex flex-wrap gap-4"
                    data-testid="radio-experience"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0-1" id="exp-0-1" />
                      <Label htmlFor="exp-0-1">0-1 years</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1-3" id="exp-1-3" />
                      <Label htmlFor="exp-1-3">1-3 years</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="3+" id="exp-3+" />
                      <Label htmlFor="exp-3+">3+ years</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Salary */}
                <div className="space-y-2">
                  <Label htmlFor="salary">Annual Salary (₹) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="500000"
                    value={formData.salary}
                    onChange={(e) => handleInputChange("salary", e.target.value)}
                    required
                    data-testid="input-salary"
                  />
                  <p className="text-xs text-gray-500">Enter your gross annual salary</p>
                </div>

                {/* Investment Experience */}
                <div className="space-y-2">
                  <Label htmlFor="investment-experience">Investment Experience</Label>
                  <RadioGroup
                    value={formData.investmentExperience}
                    onValueChange={(value) => handleInputChange("investmentExperience", value)}
                    className="flex flex-wrap gap-4"
                    data-testid="radio-investment-experience"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="beginner" id="inv-beginner" />
                      <Label htmlFor="inv-beginner">Beginner</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediate" id="inv-intermediate" />
                      <Label htmlFor="inv-intermediate">Intermediate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="advanced" id="inv-advanced" />
                      <Label htmlFor="inv-advanced">Advanced</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              {/* Risk Tolerance */}
              <div className="space-y-2">
                <Label htmlFor="risk-tolerance">Risk Tolerance</Label>
                <RadioGroup
                  value={formData.riskTolerance}
                  onValueChange={(value) => handleInputChange("riskTolerance", value)}
                  className="flex flex-wrap gap-6"
                  data-testid="radio-risk-tolerance"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="conservative" id="risk-conservative" />
                    <Label htmlFor="risk-conservative">Conservative (Safety first)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="risk-moderate" />
                    <Label htmlFor="risk-moderate">Moderate (Balanced approach)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="aggressive" id="risk-aggressive" />
                    <Label htmlFor="risk-aggressive">Aggressive (Higher returns)</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Goals */}
              <div className="space-y-2">
                <Label htmlFor="goals">Financial Goals (Optional)</Label>
                <Textarea
                  id="goals"
                  placeholder="E.g., Buy a house, save for marriage, build emergency fund..."
                  value={formData.goals}
                  onChange={(e) => handleInputChange("goals", e.target.value)}
                  rows={3}
                  data-testid="textarea-goals"
                />
                <p className="text-xs text-gray-500">This helps us suggest better investment options</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="submit" 
                  disabled={updateSessionMutation.isPending}
                  className="flex-1"
                  data-testid="button-continue"
                >
                  {updateSessionMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-arrow-right mr-2"></i>
                      Continue to Upload Form 16
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="flex-1"
                  data-testid="button-save-later"
                >
                  <i className="fas fa-save mr-2"></i>
                  Save & Continue Later
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <i className="fas fa-info-circle text-primary mt-1"></i>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Why do we ask this?</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <strong>Age & Experience:</strong> Helps suggest age-appropriate investments</li>
                  <li>• <strong>Salary:</strong> Determines your tax bracket and savings potential</li>
                  <li>• <strong>Risk Tolerance:</strong> Ensures suggestions match your comfort level</li>
                  <li>• <strong>Goals:</strong> Personalizes recommendations for your objectives</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
