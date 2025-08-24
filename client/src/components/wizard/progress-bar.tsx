import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900" data-testid="progress-title">
          Tax Filing Progress
        </h2>
        <span className="text-sm text-gray-500" data-testid="progress-steps">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <Progress 
        value={progressPercentage} 
        className="h-3 mb-2" 
        data-testid="progress-bar"
      />
      <p className="text-sm text-gray-600" data-testid="progress-estimate">
        {currentStep === totalSteps 
          ? "🎉 Tax filing completed!" 
          : `Estimated ${Math.max(1, (totalSteps - currentStep) * 2)} minutes remaining`
        }
      </p>
    </div>
  );
}
