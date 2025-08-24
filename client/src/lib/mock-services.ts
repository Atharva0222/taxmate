// Mock services for simulating AI-powered features
// These would be replaced with real API calls in production

export interface Form16Data {
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

export class MockOCRService {
  static async extractForm16Data(file: File): Promise<Form16Data> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock extracted data
    return {
      name: "RAHUL KUMAR SHARMA",
      pan: "ABCDE1234F",
      employer: "ABC Tech Solutions Pvt Ltd",
      grossSalary: 850000,
      standardDeduction: 50000,
      professionalTax: 2400,
      deductions: {
        "80C": 58000,
        "80D": 0,
      },
      tdsDeducted: 98000,
      financialYear: "2023-24",
    };
  }
}

export class MockTaxCalculatorService {
  static calculateIncomeTax(taxableIncome: number): number {
    // New tax regime for FY 2023-24
    let tax = 0;
    
    if (taxableIncome <= 300000) {
      tax = 0;
    } else if (taxableIncome <= 600000) {
      tax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 900000) {
      tax = 15000 + (taxableIncome - 600000) * 0.10;
    } else if (taxableIncome <= 1200000) {
      tax = 45000 + (taxableIncome - 900000) * 0.15;
    } else if (taxableIncome <= 1500000) {
      tax = 90000 + (taxableIncome - 1200000) * 0.20;
    } else {
      tax = 150000 + (taxableIncome - 1500000) * 0.30;
    }

    // Add health and education cess (4%)
    tax = tax * 1.04;

    return Math.round(tax);
  }

  static generateTaxSuggestions(extractedData: Form16Data): TaxSuggestions {
    const taxRate = 0.312; // Approximate tax rate for the income bracket
    
    return {
      elss: {
        section: "80C",
        title: "ELSS Mutual Funds",
        description: "Invest ₹1,50,000 in ELSS to save up to ₹46,800 in tax",
        maxInvestment: 150000,
        currentInvestment: extractedData.deductions["80C"] || 0,
        taxSaving: Math.min(150000 - (extractedData.deductions["80C"] || 0), 150000) * taxRate,
        priority: "high",
      },
      healthInsurance: {
        section: "80D",
        title: "Health Insurance",
        description: "Get ₹25,000 health cover + save ₹7,800 in tax",
        maxInvestment: 25000,
        currentInvestment: extractedData.deductions["80D"] || 0,
        taxSaving: Math.min(25000 - (extractedData.deductions["80D"] || 0), 25000) * taxRate,
        priority: "medium",
      },
      nps: {
        section: "80CCD(1B)",
        title: "National Pension Scheme",
        description: "Additional ₹50,000 deduction under 80CCD(1B)",
        maxInvestment: 50000,
        currentInvestment: 0,
        taxSaving: 50000 * taxRate,
        priority: "low",
      },
    };
  }
}

export class MockChatbotService {
  static async getResponse(question: string): Promise<string> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const normalizedQuestion = question.toLowerCase();
    
    // Simple keyword matching for responses
    if (normalizedQuestion.includes('elss')) {
      return "ELSS (Equity Linked Savings Scheme) are special mutual funds that qualify for tax deduction under Section 80C. Think of them as investing in companies while saving tax! You can invest up to ₹1.5 lakh per year and save tax up to ₹46,800. The money is locked for 3 years, but historically ELSS funds have given good returns.";
    }
    
    if (normalizedQuestion.includes('80c') && normalizedQuestion.includes('80d')) {
      return "80C and 80D are different tax-saving sections:\n\n80C: Saves tax on investments like PPF, ELSS, life insurance (up to ₹1.5 lakh)\n80D: Saves tax on health insurance premiums (up to ₹25,000 for self)\n\nYou can use both! They're separate limits, so you can save tax on both investments and health insurance.";
    }
    
    if (normalizedQuestion.includes('deadline') || normalizedQuestion.includes('itr')) {
      return "The ITR filing deadline for FY 2023-24 is July 31, 2024. If you miss this, you can still file a belated return till December 31, 2024, but you might face penalties. It's always better to file on time!";
    }
    
    if (normalizedQuestion.includes('calculate') || normalizedQuestion.includes('tax')) {
      return "Income tax calculation depends on your income slab:\n• Up to ₹3 lakh: No tax\n• ₹3-6 lakh: 5%\n• ₹6-9 lakh: 10%\n• ₹9-12 lakh: 15%\n• ₹12-15 lakh: 20%\n• Above ₹15 lakh: 30%\n\nPlus 4% cess on total tax. Don't forget deductions like 80C, 80D to reduce taxable income!";
    }
    
    if (normalizedQuestion.includes('investment') || normalizedQuestion.includes('save')) {
      return "Best tax-saving investments for young professionals:\n\n1. ELSS Mutual Funds (80C) - Growth potential + tax saving\n2. PPF (80C) - Safe, 15-year lock-in\n3. Health Insurance (80D) - Essential protection\n4. NPS (80CCD1B) - Additional ₹50K deduction\n5. Term Insurance - Low cost, high coverage\n\nStart with ELSS and health insurance for maximum benefit!";
    }
    
    // Default response
    return "I'm here to help with all your tax questions! You can ask me about:\n• Tax-saving investments (80C, 80D)\n• ITR filing process\n• Deductions and exemptions\n• How to calculate tax\n• Investment suggestions\n\nWhat would you like to know?";
  }
}
