import { Badge } from "@/components/ui/badge";

interface StepNavigationProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: "Login", icon: "fas fa-sign-in-alt" },
  { number: 2, title: "Q&A", icon: "fas fa-question-circle" },
  { number: 3, title: "Upload", icon: "fas fa-cloud-upload-alt" },
  { number: 4, title: "Extract", icon: "fas fa-robot" },
  { number: 5, title: "Review", icon: "fas fa-eye" },
  { number: 6, title: "Tax Tips", icon: "fas fa-lightbulb" },
  { number: 7, title: "ITR-1", icon: "fas fa-file-invoice" },
  { number: 8, title: "Download", icon: "fas fa-download" },
  { number: 9, title: "Complete", icon: "fas fa-check-circle" },
];

export default function StepNavigation({ currentStep }: StepNavigationProps) {
  const getStepStatus = (stepNumber: number) => {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "current";
    return "pending";
  };

  const getStepClasses = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white";
      case "current":
        return "bg-primary text-white animate-pulse";
      default:
        return "bg-gray-200 text-gray-600";
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default" as const;
      case "current":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between space-x-4 overflow-x-auto pb-2">
        {steps.map((step, index) => {
          const status = getStepStatus(step.number);
          return (
            <div key={step.number} className="flex items-center space-x-2 whitespace-nowrap">
              <Badge 
                variant={getBadgeVariant(status)}
                className={`${getStepClasses(status)} px-3 py-1 text-sm`}
                data-testid={`step-badge-${step.number}`}
              >
                {status === "completed" ? (
                  <i className="fas fa-check text-xs mr-1"></i>
                ) : status === "current" ? (
                  <i className="fas fa-spinner fa-spin text-xs mr-1"></i>
                ) : (
                  <i className={`${step.icon} text-xs mr-1`}></i>
                )}
                {step.title}
              </Badge>
              {index < steps.length - 1 && (
                <i className="fas fa-chevron-right text-gray-400 text-xs"></i>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center space-x-2 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${getStepClasses(getStepStatus(currentStep))}`}>
            {getStepStatus(currentStep) === "completed" ? (
              <i className="fas fa-check text-xs"></i>
            ) : (
              currentStep
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900" data-testid="current-step-title">
              {steps.find(s => s.number === currentStep)?.title}
            </h3>
            <p className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </p>
          </div>
        </div>
        
        {/* Progress dots */}
        <div className="flex space-x-1">
          {steps.map((step) => {
            const status = getStepStatus(step.number);
            return (
              <div
                key={step.number}
                className={`w-3 h-3 rounded-full ${
                  status === "completed" 
                    ? "bg-green-500" 
                    : status === "current" 
                    ? "bg-primary" 
                    : "bg-gray-300"
                }`}
                data-testid={`step-dot-${step.number}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
