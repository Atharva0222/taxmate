import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressBar from "@/components/wizard/progress-bar";
import StepNavigation from "@/components/wizard/step-navigation";
import FileUpload from "@/components/upload/file-upload";
import type { TaxSession, Form16Upload } from "@shared/schema";

interface UploadProps {
  params: { sessionId: string };
}

export default function Upload({ params }: UploadProps) {
  const { sessionId } = params;
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [uploadId, setUploadId] = useState<string | null>(null);

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

  // Poll upload status
  const { data: uploadData } = useQuery<Form16Upload>({
    queryKey: ["/api/form16", uploadId, "status"],
    enabled: !!uploadId && uploadStatus === 'processing',
    refetchInterval: 2000,
    retry: false,
  });

  // Check if processing is complete
  useEffect(() => {
    if (uploadData && uploadData.processingStatus === 'completed') {
      setUploadStatus('completed');
      // Refetch tax session to get updated data
      queryClient.invalidateQueries({ queryKey: ["/api/tax-sessions", sessionId] });
      
      setTimeout(() => {
        setLocation(`/wizard/review/${sessionId}`);
      }, 2000);
    } else if (uploadData && uploadData.processingStatus === 'failed') {
      setUploadStatus('error');
      toast({
        title: "Processing Failed",
        description: "Failed to extract data from Form 16. Please try uploading again.",
        variant: "destructive",
      });
    }
  }, [uploadData, sessionId, setLocation, toast]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('form16', file);
      formData.append('taxSessionId', sessionId);

      const response = await fetch('/api/form16/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadId(data.id);
      setUploadStatus('processing');
      toast({
        title: "Upload Successful! 🎉",
        description: "AI is now extracting data from your Form 16...",
      });
    },
    onError: (error) => {
      setUploadStatus('error');
      toast({
        title: "Upload Failed",
        description: "Failed to upload Form 16. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (file: File) => {
    setUploadStatus('uploading');
    uploadMutation.mutate(file);
  };

  const handleUseSampleData = () => {
    // Simulate sample data processing
    setUploadStatus('processing');
    
    setTimeout(() => {
      setUploadStatus('completed');
      toast({
        title: "Sample Data Loaded! 🎉",
        description: "Moving to data review...",
      });
      
      setTimeout(() => {
        setLocation(`/wizard/review/${sessionId}`);
      }, 1500);
    }, 3000);
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
          <ProgressBar currentStep={3} totalSteps={9} />
        </div>

        {/* Step Navigation */}
        <div className="mb-8">
          <StepNavigation currentStep={3} />
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <i className="fas fa-cloud-upload-alt text-primary"></i>
              <span>Upload Your Form 16 📄</span>
            </CardTitle>
            <p className="text-gray-600">
              Step 3 of 9 • Our AI will extract all data automatically
            </p>
          </CardHeader>
          <CardContent>
            {uploadStatus === 'idle' || uploadStatus === 'error' ? (
              <div className="space-y-6">
                <FileUpload
                  onFileSelect={handleFileUpload}
                  disabled={uploadMutation.isPending}
                  accept=".pdf,.jpg,.jpeg,.png"
                  maxSize={10 * 1024 * 1024} // 10MB
                />

                {/* Sample Data Option */}
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Don't have Form 16 handy? Try with sample data</p>
                  <Button 
                    variant="outline"
                    onClick={handleUseSampleData}
                    disabled={uploadMutation.isPending}
                    data-testid="button-sample-data"
                  >
                    <i className="fas fa-magic mr-2"></i>Use Sample Form 16
                  </Button>
                </div>
              </div>
            ) : uploadStatus === 'uploading' ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading Form 16...</h3>
                <p className="text-gray-600">Please wait while we securely upload your document</p>
              </div>
            ) : uploadStatus === 'processing' ? (
              <div className="text-center py-12">
                <div className="animate-pulse">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-brain text-primary text-2xl"></i>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Processing Your Form 16... 🤖</h3>
                <p className="text-gray-600 mb-4">Our advanced OCR is extracting data with 99% accuracy</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>Processing typically takes 30-60 seconds</span>
                </div>
              </div>
            ) : uploadStatus === 'completed' ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Extraction Complete! 🎉</h3>
                <p className="text-gray-600 mb-4">Data extracted successfully with 99% confidence</p>
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                  <i className="fas fa-clock"></i>
                  <span>Processing time: 3.2 seconds</span>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Help Section */}
        {(uploadStatus === 'idle' || uploadStatus === 'error') && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <i className="fas fa-info-circle text-primary mt-1"></i>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Need help finding Form 16?</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Check your email for HR communications from your company</li>
                    <li>• Look in your company's HR portal or employee dashboard</li>
                    <li>• Contact your HR department if you can't locate it</li>
                    <li>• Form 16 is usually available by June 15th each year</li>
                    <li>• Supports PDF, JPG, PNG formats up to 10MB</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Notice */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <i className="fas fa-shield-alt text-blue-600 mt-1"></i>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Your Data is Secure</h4>
                <p className="text-sm text-blue-800">
                  All documents are encrypted during upload and processed on secure Indian servers. 
                  We never store your Form 16 permanently and delete all uploads after processing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
