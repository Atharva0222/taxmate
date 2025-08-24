import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const [showDemo, setShowDemo] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const features = [
    {
      icon: "🤖",
      title: "AI-Powered OCR",
      description: "Simply upload your Form 16 PDF or photo. Our AI extracts all data automatically with 99% accuracy.",
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      icon: "🎓",
      title: "Beginner-Friendly",
      description: '"Explain like I\'m 5" feature turns complex tax jargon into simple, understandable language.',
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      color: "text-green-600"
    },
    {
      icon: "🏦",
      title: "Smart Tax Savings",
      description: "Get personalized investment suggestions for 80C, 80D deductions based on your profile.",
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      color: "text-amber-600"
    },
    {
      icon: "💬",
      title: "TaxBot Assistant",
      description: "24/7 AI chatbot answers all your tax questions in simple Hindi or English.",
      bg: "bg-purple-50",
      iconBg: "bg-purple-100",
      color: "text-purple-600"
    },
    {
      icon: "📄",
      title: "Ready ITR-1 JSON",
      description: "Download your completed ITR-1 in JSON format, ready to upload on Income Tax Portal.",
      bg: "bg-indigo-50",
      iconBg: "bg-indigo-100",
      color: "text-indigo-600"
    },
    {
      icon: "📱",
      title: "Mobile Optimized",
      description: "File your taxes on-the-go with our mobile-first design. Works perfectly on any device.",
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      color: "text-red-600"
    }
  ];

  const steps = [
    { step: 1, title: "Google Login", description: "Secure one-click authentication", color: "bg-primary" },
    { step: 2, title: "Friendly Q&A", description: "Tell us about your financial goals", color: "bg-primary" },
    { step: 3, title: "Upload Form 16", description: "PDF or image, we handle both", color: "bg-primary" },
    { step: 4, title: "AI Extraction", description: "OCR + GPT extracts all data", color: "bg-secondary" },
    { step: 5, title: "Data Walkthrough", description: "Verify with simple explanations", color: "bg-secondary" },
    { step: 6, title: "Tax-Saving Tips", description: "Personalized investment advice", color: "bg-secondary" },
    { step: 7, title: "Auto-fill ITR-1", description: "Form populated automatically", color: "bg-accent" },
    { step: 8, title: "TaxBot Chat", description: "Ask questions anytime", color: "bg-accent" },
    { step: 9, title: "Download & File", description: "Get your ITR-1 JSON file", color: "bg-accent" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <i className="fas fa-calculator text-primary text-2xl"></i>
              <span className="text-xl font-bold text-gray-900">EZTaxMate</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors" data-testid="nav-features">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors" data-testid="nav-how-it-works">How it Works</a>
              <Button onClick={() => setShowAuthModal(true)} data-testid="button-signin">
                <i className="fab fa-google mr-2"></i>Sign in with Google
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6" data-testid="hero-title">
              Tax Filing Made <span className="text-primary">Simple</span> 📊
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-testid="hero-description">
              AI-powered tax filing for young professionals in India. Upload your Form 16, get personalized tax-saving tips, and download your ITR-1 in minutes!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" onClick={() => setShowAuthModal(true)} className="px-8 py-3 text-lg font-semibold" data-testid="button-start-filing">
                <i className="fab fa-google mr-2"></i>Start Filing Now - Free
              </Button>
              <Button variant="outline" size="lg" onClick={() => setShowDemo(true)} className="px-8 py-3 text-lg font-semibold" data-testid="button-watch-demo">
                <i className="fas fa-play mr-2"></i>Watch Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4" data-testid="hero-features">
              ✅ Free for salary up to ₹5 LPA • 🔒 Bank-level security
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4" data-testid="features-title">
              Why Young Professionals Choose EZTaxMate
            </h2>
            <p className="text-lg text-gray-600" data-testid="features-subtitle">
              Built specifically for freshers and early-career professionals in India
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className={`${feature.bg} border-none hover:shadow-lg transition-shadow`} data-testid={`feature-card-${index}`}>
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                    <span className="text-xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-3" data-testid={`feature-title-${index}`}>{feature.title}</h3>
                  <p className="text-gray-600" data-testid={`feature-description-${index}`}>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4" data-testid="steps-title">
              9 Simple Steps to Tax Freedom 🎯
            </h2>
            <p className="text-lg text-gray-600" data-testid="steps-subtitle">
              From login to ITR-1 download in under 15 minutes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[0, 1, 2].map(colIndex => (
              <div key={colIndex} className="space-y-6">
                {steps.slice(colIndex * 3, (colIndex + 1) * 3).map((step, index) => (
                  <div key={step.step} className="flex items-start space-x-4" data-testid={`step-${step.step}`}>
                    <div className={`w-8 h-8 ${step.color} text-white rounded-full flex items-center justify-center font-semibold text-sm`}>
                      {step.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900" data-testid={`step-title-${step.step}`}>{step.title}</h3>
                      <p className="text-gray-600 text-sm" data-testid={`step-description-${step.step}`}>{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" onClick={() => setShowDemo(true)} data-testid="button-try-demo">
              Try Interactive Demo →
            </Button>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md" data-testid="modal-auth">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-shield-alt text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="auth-title">Secure Login</h2>
            <p className="text-gray-600 mb-6" data-testid="auth-description">
              Sign in with Google to start your tax filing journey
            </p>
            
            <Button className="w-full mb-4" onClick={() => window.location.href = '/api/login'} data-testid="button-google-login">
              <i className="fab fa-google mr-3"></i>Continue with Google
            </Button>
            
            <div className="text-sm text-gray-500 space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <i className="fas fa-lock text-green-500"></i>
                <span>Bank-level encryption</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <i className="fas fa-user-shield text-green-500"></i>
                <span>Your data never leaves India</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <i className="fas fa-check-circle text-green-500"></i>
                <span>GDPR & IT Act compliant</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Demo Modal - Basic placeholder */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="sm:max-w-4xl" data-testid="modal-demo">
          <div className="p-6">
            <h3 className="text-2xl font-bold mb-4">Interactive Demo</h3>
            <p className="text-gray-600 mb-4">
              This would show an interactive demo of the tax filing process. In the full application, 
              users would be able to walkthrough each step with sample data.
            </p>
            <Button onClick={() => setShowAuthModal(true)} data-testid="button-start-now">
              Start Real Filing Now
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <i className="fas fa-calculator text-primary text-xl"></i>
                <span className="text-xl font-bold">EZTaxMate</span>
              </div>
              <p className="text-gray-400 text-sm">Simplifying tax filing for young professionals across India.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tax Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 EZTaxMate. Made with ❤️ for young India. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
