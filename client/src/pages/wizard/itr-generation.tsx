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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProgressBar from "@/components/wizard/progress-bar";
import StepNavigation from "@/components/wizard/step-navigation";
import type { TaxSession } from "@shared/schema";

interface ITRGenerationProps {
  params: { sessionId: string };
}

export default function ITRGeneration({ params }: ITRGenerationProps) {
  const { sessionId } = params;
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'completed' | 'error'>('idle');
  const [itrData, setItrData] = useState<any>(null);

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

  // Generate ITR mutation
  const generateITRMutation = useMutation({
    mutationFn: async (appliedSuggestions: any) => {
      const response = await apiRequest("POST", "/api/generate-itr", {
        taxSessionId: sessionId,
        appliedSuggestions,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setItrData(data);
      setGenerationStatus('completed');
      queryClient.invalidateQueries({ queryKey: ["/api/tax-sessions", sessionId] });
      toast({
        title: "ITR-1 Generated Successfully! 🎉",
        description: "Your tax return is ready for download",
      });
    },
    onError: (error) => {
      setGenerationStatus('error');
      toast({
        title: "Generation Failed",
        description: "Failed to generate ITR-1. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateITR = () => {
    setGenerationStatus('generating');
    const appliedSuggestions = taxSession?.appliedSuggestions || {};
    
    // Simulate generation time
    setTimeout(() => {
      generateITRMutation.mutate(appliedSuggestions);
    }, 2000);
  };

  const handleDownloadJSON = () => {
    if (!itrData) return;

    const jsonString = JSON.stringify(itrData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ITR1_${itrData.personalInfo?.pan || 'Unknown'}_${itrData.financialYear || '2023-24'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started! 📥",
      description: "Your ITR-1 JSON file is being downloaded",
    });
  };

  // Check if session has ITR data already
  useEffect(() => {
    if (taxSession?.itrData) {
      setItrData(taxSession.itrData);
      setGenerationStatus('completed');
    }
  }, [taxSession]);

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
          <ProgressBar currentStep={generationStatus === 'completed' ? 9 : 7} totalSteps={9} />
        </div>

        {/* Step Navigation */}
        <div className="mb-8">
          <StepNavigation currentStep={generationStatus === 'completed' ? 9 : 7} />
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {generationStatus === 'completed' ? (
                <>
                  <i className="fas fa-check-circle text-green-600"></i>
                  <span>ITR-1 Generated Successfully! 🎉</span>
                </>
              ) : (
                <>
                  <i className="fas fa-file-invoice text-primary"></i>
                  <span>Generate Your ITR-1 📋</span>
                </>
              )}
            </CardTitle>
            <p className="text-gray-600">
              {generationStatus === 'completed' 
                ? "Your tax return is ready for download and filing"
                : "Final step • Review and generate your complete ITR-1 form"
              }
            </p>
          </CardHeader>
          <CardContent>
            {generationStatus === 'idle' || generationStatus === 'error' ? (
              <div className="space-y-6">
                {/* Summary before generation */}
                <Card className="bg-blue-50 border border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Ready to Generate ITR-1</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Name: {(taxSession.extractedData as any)?.name}</li>
                          <li>• PAN: {(taxSession.extractedData as any)?.pan}</li>
                          <li>• Financial Year: {(taxSession.extractedData as any)?.financialYear}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Tax Summary</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Gross Salary: ₹{(taxSession.extractedData as any)?.grossSalary?.toLocaleString()}</li>
                          <li>• TDS Paid: ₹{(taxSession.extractedData as any)?.tdsDeducted?.toLocaleString()}</li>
                          <li>• Expected Refund: ₹12,400</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-file-invoice text-primary text-2xl"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Generate Your ITR-1</h3>
                  <p className="text-gray-600 mb-6">
                    We'll create a complete ITR-1 form in JSON format that you can directly upload to the Income Tax Portal
                  </p>
                  <Button 
                    size="lg"
                    onClick={handleGenerateITR}
                    disabled={generateITRMutation.isPending}
                    data-testid="button-generate-itr"
                  >
                    {generateITRMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Generating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic mr-2"></i>
                        Generate ITR-1 Form
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : generationStatus === 'generating' ? (
              <div className="text-center py-12">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-cogs text-primary text-2xl"></i>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Your ITR-1... 🔧</h3>
                <p className="text-gray-600 mb-4">Processing your tax data and creating the form</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>This usually takes 30-60 seconds</span>
                </div>
              </div>
            ) : generationStatus === 'completed' && itrData ? (
              <div className="space-y-6">
                {/* Success Message */}
                <Card className="bg-green-50 border border-green-200">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-check text-green-600 text-2xl"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">ITR-1 Generated Successfully!</h3>
                    <p className="text-green-800 mb-4">
                      Your tax return is ready for download. You can now file it on the Income Tax Portal.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={handleDownloadJSON} data-testid="button-download-json">
                        <i className="fas fa-download mr-2"></i>Download ITR-1 JSON
                      </Button>
                      <Button variant="outline" onClick={() => setLocation("/")} data-testid="button-back-dashboard">
                        <i className="fas fa-home mr-2"></i>Back to Dashboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* ITR Data Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>ITR-1 Preview</CardTitle>
                    <p className="text-gray-600">Review your generated tax return data</p>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="summary" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="income">Income</TabsTrigger>
                        <TabsTrigger value="deductions">Deductions</TabsTrigger>
                        <TabsTrigger value="tax">Tax Details</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="summary" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <Card className="bg-gray-50">
                            <CardContent className="p-4">
                              <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Name:</span>
                                  <span>{itrData.personalInfo?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">PAN:</span>
                                  <span>{itrData.personalInfo?.pan}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Financial Year:</span>
                                  <span>{itrData.financialYear}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <Card className="bg-gray-50">
                            <CardContent className="p-4">
                              <h4 className="font-medium text-gray-900 mb-2">Tax Summary</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Tax Payable:</span>
                                  <span>₹{itrData.taxDetails?.taxPayable?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">TDS Deducted:</span>
                                  <span>₹{itrData.taxDetails?.tdsDeducted?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 font-medium">Refund Due:</span>
                                  <span className="text-green-600 font-medium">₹{itrData.taxDetails?.refundDue?.toLocaleString()}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </TabsContent>

                      <TabsContent value="income" className="space-y-4">
                        <Card className="bg-gray-50">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Salary Income Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Gross Salary:</span>
                                <span>₹{itrData.incomeDetails?.salaryIncome?.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Standard Deduction:</span>
                                <span>₹{itrData.incomeDetails?.standardDeduction?.toLocaleString()}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-medium">
                                <span>Taxable Income:</span>
                                <span>₹{itrData.incomeDetails?.taxableIncome?.toLocaleString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="deductions" className="space-y-4">
                        <Card className="bg-gray-50">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Tax Deductions</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Section 80C:</span>
                                <span>₹{itrData.deductions?.section80C?.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Section 80D:</span>
                                <span>₹{itrData.deductions?.section80D?.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Section 80CCD(1B):</span>
                                <span>₹{itrData.deductions?.section80CCD1B?.toLocaleString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="tax" className="space-y-4">
                        <Card className="bg-gray-50">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-gray-900 mb-3">Tax Calculation</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tax Payable:</span>
                                <span>₹{itrData.taxDetails?.taxPayable?.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">TDS Deducted:</span>
                                <span>₹{itrData.taxDetails?.tdsDeducted?.toLocaleString()}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-medium text-green-600">
                                <span>Refund Amount:</span>
                                <span>₹{itrData.taxDetails?.refundDue?.toLocaleString()}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Card className="bg-blue-50 border border-blue-200">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-blue-900 mb-3">Next Steps - How to File</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                      <li>Download the ITR-1 JSON file using the button above</li>
                      <li>Visit the <a href="https://www.incometax.gov.in" target="_blank" className="underline font-medium">Income Tax e-Filing Portal</a></li>
                      <li>Login with your credentials or register if new</li>
                      <li>Go to "File Return" → "Upload JSON"</li>
                      <li>Upload the downloaded JSON file</li>
                      <li>Review, verify, and submit your return</li>
                      <li>E-verify using Aadhaar OTP or other methods</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
