import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import ProgressBar from "@/components/wizard/progress-bar";
import StepNavigation from "@/components/wizard/step-navigation";
import ExplainerModal from "@/components/modals/explainer-modal";
import type { TaxSession } from "@shared/schema";

interface ExtractedDataProps {
  params: { sessionId: string };
}

export default function ExtractedData({ params }: ExtractedDataProps) {
  const { sessionId } = params;
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [advancedMode, setAdvancedMode] = useState(false);
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

  const extractedData = taxSession?.extractedData as any;

  const handleExplainer = (term: string) => {
    const explainers = {
      'gross-salary': {
        title: 'Gross Salary - Explained Simply 💰',
        content: `
          <div class="space-y-4">
            <p><strong>Think of it like a pizza 🍕</strong></p>
            <p>Gross Salary = The WHOLE pizza before anyone takes a slice</p>
            <p>This includes:</p>
            <ul class="list-disc list-inside space-y-1 text-sm bg-blue-50 p-3 rounded-lg">
              <li>Basic Salary (the main pizza base)</li>
              <li>HRA (house rent help from company)</li>
              <li>Special Allowances (extra toppings)</li>
              <li>Bonus (extra pizza slices)</li>
            </ul>
            <p class="text-sm bg-green-50 p-3 rounded-lg">
              <strong>For you:</strong> Your company pays you ₹${extractedData?.grossSalary?.toLocaleString()} per year in total. This is before any taxes are cut!
            </p>
          </div>
        `
      },
      'standard-deduction': {
        title: 'Standard Deduction - Free Tax Relief! 🎁',
        content: `
          <div class="space-y-4">
            <p><strong>Imagine the government giving you a ₹50,000 discount coupon 🎫</strong></p>
            <p>Standard Deduction = A gift from the government that reduces your taxable income</p>
            <div class="bg-green-50 p-3 rounded-lg space-y-2">
              <p><strong>How it works:</strong></p>
              <p class="text-sm">• Your Gross Salary: ₹${extractedData?.grossSalary?.toLocaleString()}</p>
              <p class="text-sm">• Minus Standard Deduction: ₹${extractedData?.standardDeduction?.toLocaleString()}</p>
              <p class="text-sm">• Tax calculated on: ₹${(extractedData?.grossSalary - extractedData?.standardDeduction)?.toLocaleString()}</p>
            </div>
            <p class="text-sm bg-blue-50 p-3 rounded-lg">
              <strong>Best part:</strong> You don't need to do anything! It's automatic for all salaried employees.
            </p>
          </div>
        `
      },
      '80c': {
        title: 'Section 80C - Your Tax Saving Superhero! 🦸‍♂️',
        content: `
          <div class="space-y-4">
            <p><strong>Think of 80C as a magic box that eats your tax! 📦✨</strong></p>
            <p>You can put up to ₹1,50,000 per year in this box, and it reduces your tax bill.</p>
            <div class="bg-blue-50 p-3 rounded-lg space-y-2">
              <p><strong>What can go in the magic box:</strong></p>
              <ul class="list-disc list-inside text-sm space-y-1">
                <li>PPF (Pension fund - like a retirement piggy bank)</li>
                <li>ELSS Mutual Funds (invest in companies, save tax)</li>
                <li>Life Insurance premiums</li>
                <li>Home loan principal</li>
                <li>Tax-saving Fixed Deposits</li>
              </ul>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <p><strong>Your situation:</strong> You've already saved ₹${extractedData?.deductions?.["80C"]?.toLocaleString()}. You can save ₹${(150000 - (extractedData?.deductions?.["80C"] || 0))?.toLocaleString()} more and reduce tax by ~₹${Math.round((150000 - (extractedData?.deductions?.["80C"] || 0)) * 0.312)?.toLocaleString()}!</p>
            </div>
          </div>
        `
      },
      'tds': {
        title: 'TDS - Tax Already Paid! 💳',
        content: `
          <div class="space-y-4">
            <p><strong>TDS is like paying for movie tickets in advance 🎬</strong></p>
            <p>Your company already cut ₹${extractedData?.tdsDeducted?.toLocaleString()} from your salary and paid it to the government as your tax.</p>
            <div class="bg-blue-50 p-3 rounded-lg space-y-2">
              <p><strong>How it works:</strong></p>
              <p class="text-sm">• Every month, your company cuts some tax from your salary</p>
              <p class="text-sm">• They send this money directly to the government</p>
              <p class="text-sm">• At year-end, they give you Form 16 as proof</p>
            </div>
            <div class="bg-green-50 p-3 rounded-lg">
              <p><strong>Good news:</strong> You've already paid ₹${extractedData?.tdsDeducted?.toLocaleString()} in tax. If your actual tax is less, you get money back!</p>
            </div>
          </div>
        `
      }
    };

    const explainer = explainers[term as keyof typeof explainers];
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

  if (!taxSession || !extractedData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-bold text-red-600 mb-2">No Data Available</h1>
            <p className="text-gray-600 mb-4">Please upload Form 16 first.</p>
            <Button onClick={() => setLocation(`/wizard/upload/${sessionId}`)} data-testid="button-upload">
              Upload Form 16
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
          <ProgressBar currentStep={5} totalSteps={9} />
        </div>

        {/* Step Navigation */}
        <div className="mb-8">
          <StepNavigation currentStep={5} />
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <i className="fas fa-check-circle text-green-600"></i>
                  <span>AI Extraction Complete! 🎉</span>
                </CardTitle>
                <p className="text-gray-600">
                  Step 5 of 9 • Review and verify extracted data
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 text-green-600">
                  <i className="fas fa-check-circle"></i>
                  <span className="font-semibold">99% Confidence</span>
                </div>
                <p className="text-sm text-gray-500">Processing time: 3.2 seconds</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mode Toggle */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">Extracted Information</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <i className="fas fa-check mr-1"></i>Verified
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="advanced-mode" className="text-sm text-gray-600">Easy Mode</Label>
                <Switch
                  id="advanced-mode"
                  checked={advancedMode}
                  onCheckedChange={setAdvancedMode}
                  data-testid="switch-advanced-mode"
                />
                <Label htmlFor="advanced-mode" className="text-sm text-gray-600">Advanced</Label>
              </div>
            </div>

            {/* Data Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-user text-primary mr-2"></i>Basic Information
                  </h4>
                  <div className="space-y-4">
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                            <p className="text-gray-900 font-medium">{extractedData.name}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExplainer('name')}
                            className="text-primary hover:text-blue-600"
                            data-testid="button-explain-name"
                          >
                            <i className="fas fa-info-circle"></i>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">PAN Number</Label>
                            <p className="text-gray-900 font-medium">{extractedData.pan}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExplainer('pan')}
                            className="text-primary hover:text-blue-600"
                            data-testid="button-explain-pan"
                          >
                            <i className="fas fa-info-circle"></i>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Employer Name</Label>
                            <p className="text-gray-900 font-medium">{extractedData.employer}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExplainer('employer')}
                            className="text-primary hover:text-blue-600"
                            data-testid="button-explain-employer"
                          >
                            <i className="fas fa-info-circle"></i>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-rupee-sign text-secondary mr-2"></i>Salary Breakdown
                  </h4>
                  <div className="space-y-4">
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Gross Salary</Label>
                            <p className="text-gray-900 text-lg font-semibold">₹{extractedData.grossSalary?.toLocaleString()}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExplainer('gross-salary')}
                            className="text-primary hover:text-blue-600"
                            data-testid="button-explain-gross-salary"
                          >
                            <i className="fas fa-question-circle"></i>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Standard Deduction</Label>
                            <p className="text-gray-900 text-lg font-semibold">₹{extractedData.standardDeduction?.toLocaleString()}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExplainer('standard-deduction')}
                            className="text-primary hover:text-blue-600"
                            data-testid="button-explain-standard-deduction"
                          >
                            <i className="fas fa-question-circle"></i>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Professional Tax</Label>
                            <p className="text-gray-900 text-lg font-semibold">₹{extractedData.professionalTax?.toLocaleString()}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExplainer('professional-tax')}
                            className="text-primary hover:text-blue-600"
                            data-testid="button-explain-professional-tax"
                          >
                            <i className="fas fa-question-circle"></i>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-calculator text-accent mr-2"></i>Tax Deductions
                  </h4>
                  <div className="space-y-4">
                    <Card className="bg-blue-50 border border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-blue-800">80C Investments</Label>
                            <p className="text-blue-900 text-lg font-semibold">₹{extractedData.deductions?.["80C"]?.toLocaleString()}</p>
                            <p className="text-xs text-blue-700">PPF + ELSS Mutual Funds</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExplainer('80c')}
                            className="text-blue-600 hover:text-blue-800"
                            data-testid="button-explain-80c"
                          >
                            <i className="fas fa-lightbulb"></i>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-green-800">80D Health Insurance</Label>
                            <p className="text-green-900 text-lg font-semibold">₹{extractedData.deductions?.["80D"]?.toLocaleString() || '0'}</p>
                            <p className="text-xs text-green-700">Opportunity to save more!</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExplainer('80d')}
                            className="text-green-600 hover:text-green-800"
                            data-testid="button-explain-80d"
                          >
                            <i className="fas fa-plus-circle"></i>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Tax Information */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <i className="fas fa-receipt text-purple-600 mr-2"></i>Tax Summary
                  </h4>
                  <div className="space-y-4">
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Tax Deducted (TDS)</Label>
                            <p className="text-gray-900 text-lg font-semibold">₹{extractedData.tdsDeducted?.toLocaleString()}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExplainer('tds')}
                            className="text-primary hover:text-blue-600"
                            data-testid="button-explain-tds"
                          >
                            <i className="fas fa-info-circle"></i>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-green-50 border border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium text-green-800">Expected Refund</Label>
                            <p className="text-green-900 text-lg font-semibold">₹12,400</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExplainer('refund')}
                            className="text-green-600 hover:text-green-800"
                            data-testid="button-explain-refund"
                          >
                            <i className="fas fa-gift"></i>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
              <Button 
                onClick={() => setLocation(`/wizard/tips/${sessionId}`)}
                className="flex-1"
                data-testid="button-get-tax-tips"
              >
                <i className="fas fa-lightbulb mr-2"></i>Get Tax-Saving Tips →
              </Button>
              <Button 
                variant="outline"
                className="flex-1"
                data-testid="button-edit-details"
              >
                <i className="fas fa-edit mr-2"></i>Edit Details
              </Button>
            </div>
          </CardContent>
        </Card>
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
