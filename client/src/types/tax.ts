export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingData {
  age: string;
  experience: string;
  salary: string;
  goals: string;
  investmentExperience: string;
  riskTolerance: string;
}

export interface ExtractedData {
  name: string;
  pan: string;
  employer: string;
  grossSalary: number;
  standardDeduction: number;
  professionalTax: number;
  deductions: {
    "80C": number;
    "80D": number;
  };
  tdsDeducted: number;
  financialYear: string;
}

export interface TaxSuggestion {
  section: string;
  title: string;
  description: string;
  maxInvestment: number;
  currentInvestment: number;
  taxSaving: number;
  priority: 'high' | 'medium' | 'low';
}

export interface TaxSuggestions {
  elss: TaxSuggestion;
  healthInsurance: TaxSuggestion;
  nps: TaxSuggestion;
}

export interface ITRData {
  personalInfo: {
    name: string;
    pan: string;
    address: string;
    dateOfBirth: string;
  };
  incomeDetails: {
    salaryIncome: number;
    standardDeduction: number;
    taxableIncome: number;
  };
  deductions: {
    section80C: number;
    section80D: number;
    section80CCD1B: number;
  };
  taxDetails: {
    taxPayable: number;
    tdsDeducted: number;
    refundDue: number;
  };
  generatedAt: string;
  financialYear: string;
}

export interface TaxSession {
  id: string;
  userId: string;
  financialYear: string;
  currentStep: number;
  isCompleted: boolean;
  onboardingData?: OnboardingData;
  extractedData?: ExtractedData;
  taxCalculations?: any;
  taxSuggestions?: TaxSuggestions;
  appliedSuggestions?: Record<string, number>;
  itrData?: ITRData;
  createdAt: Date;
  updatedAt: Date;
}

export interface Form16Upload {
  id: string;
  taxSessionId: string;
  fileName: string;
  fileUrl: string;
  extractedData?: ExtractedData;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  question: string;
  response: string;
  timestamp: string;
}
