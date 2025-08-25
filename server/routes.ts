import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { createTaxSessionSchema, updateTaxSessionSchema, createForm16UploadSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";

const upload = multer({ dest: 'uploads/' });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - setupAuth handles all auth endpoints
  setupAuth(app);

  // Tax-related routes follow below...

  // Tax session routes
  app.post('/api/tax-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = createTaxSessionSchema.parse(req.body);
      const forceNew = req.query.forceNew === 'true';
      
      // Check if session already exists for this year (only if not forcing new)
      if (!forceNew) {
        const existingSession = await storage.getTaxSessionByUser(userId, validatedData.financialYear);
        if (existingSession) {
          return res.json(existingSession);
        }
      }

      const taxSession = await storage.createTaxSession({
        ...validatedData,
        userId,
      });
      
      res.json(taxSession);
    } catch (error) {
      console.error("Error creating tax session:", error);
      res.status(500).json({ message: "Failed to create tax session" });
    }
  });

  // Get all tax sessions for user by financial year
  app.get('/api/tax-sessions/user/all/:financialYear', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { financialYear } = req.params;
      
      const sessions = await storage.getAllTaxSessionsByUser(userId, financialYear);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching tax sessions:", error);
      res.status(500).json({ message: "Failed to fetch tax sessions" });
    }
  });

  app.get('/api/tax-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taxSession = await storage.getTaxSession(req.params.id);
      
      if (!taxSession || taxSession.userId !== userId) {
        return res.status(404).json({ message: "Tax session not found" });
      }
      
      res.json(taxSession);
    } catch (error) {
      console.error("Error fetching tax session:", error);
      res.status(500).json({ message: "Failed to fetch tax session" });
    }
  });

  app.put('/api/tax-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taxSession = await storage.getTaxSession(req.params.id);
      
      if (!taxSession || taxSession.userId !== userId) {
        return res.status(404).json({ message: "Tax session not found" });
      }

      const validatedData = updateTaxSessionSchema.parse(req.body);
      const updated = await storage.updateTaxSession(req.params.id, validatedData);
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating tax session:", error);
      res.status(500).json({ message: "Failed to update tax session" });
    }
  });

  app.get('/api/tax-sessions/user/:financialYear', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taxSession = await storage.getTaxSessionByUser(userId, req.params.financialYear);
      
      res.json(taxSession || null);
    } catch (error) {
      console.error("Error fetching user tax session:", error);
      res.status(500).json({ message: "Failed to fetch tax session" });
    }
  });

  // Form 16 upload routes
  app.post('/api/form16/upload', isAuthenticated, upload.single('form16'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { taxSessionId } = req.body;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Verify tax session belongs to user
      const taxSession = await storage.getTaxSession(taxSessionId);
      if (!taxSession || taxSession.userId !== userId) {
        return res.status(404).json({ message: "Tax session not found" });
      }

      const upload = await storage.createForm16Upload({
        taxSessionId,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
      });

      // Simulate OCR processing
      setTimeout(async () => {
        try {
          const mockExtractedData = {
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

          await storage.updateForm16Upload(upload.id, {
            extractedData: mockExtractedData,
            processingStatus: "completed",
          });

          // Update tax session with extracted data
          await storage.updateTaxSession(taxSessionId, {
            extractedData: mockExtractedData,
            currentStep: 5, // Move to data review step
          });
        } catch (error) {
          console.error("Error processing Form 16:", error);
          await storage.updateForm16Upload(upload.id, {
            processingStatus: "failed",
          });
        }
      }, 3000); // Simulate 3 second processing

      res.json(upload);
    } catch (error) {
      console.error("Error uploading Form 16:", error);
      res.status(500).json({ message: "Failed to upload Form 16" });
    }
  });

  app.get('/api/form16/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const upload = await storage.getForm16Upload(req.params.id);
      
      if (!upload) {
        return res.status(404).json({ message: "Upload not found" });
      }

      // Verify ownership
      const taxSession = await storage.getTaxSession(upload.taxSessionId);
      if (!taxSession || taxSession.userId !== userId) {
        return res.status(404).json({ message: "Upload not found" });
      }

      res.json(upload);
    } catch (error) {
      console.error("Error fetching upload status:", error);
      res.status(500).json({ message: "Failed to fetch upload status" });
    }
  });

  // Tax suggestions route
  app.post('/api/tax-suggestions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { taxSessionId } = req.body;

      const taxSession = await storage.getTaxSession(taxSessionId);
      if (!taxSession || taxSession.userId !== userId) {
        return res.status(404).json({ message: "Tax session not found" });
      }

      const extractedData = taxSession.extractedData as any;
      if (!extractedData) {
        return res.status(400).json({ message: "No extracted data available" });
      }

      // Generate mock tax suggestions
      const suggestions = {
        elss: {
          section: "80C",
          title: "ELSS Mutual Funds",
          description: "Invest ₹1,50,000 in ELSS to save up to ₹46,800 in tax",
          maxInvestment: 150000,
          currentInvestment: extractedData.deductions["80C"] || 0,
          taxSaving: Math.min(150000 - (extractedData.deductions["80C"] || 0), 150000) * 0.312,
          priority: "high",
        },
        healthInsurance: {
          section: "80D",
          title: "Health Insurance",
          description: "Get ₹25,000 health cover + save ₹7,800 in tax",
          maxInvestment: 25000,
          currentInvestment: extractedData.deductions["80D"] || 0,
          taxSaving: Math.min(25000 - (extractedData.deductions["80D"] || 0), 25000) * 0.312,
          priority: "medium",
        },
        nps: {
          section: "80CCD(1B)",
          title: "National Pension Scheme",
          description: "Additional ₹50,000 deduction under 80CCD(1B)",
          maxInvestment: 50000,
          currentInvestment: 0,
          taxSaving: 50000 * 0.312,
          priority: "low",
        },
      };

      await storage.updateTaxSession(taxSessionId, {
        taxSuggestions: suggestions,
        currentStep: 6, // Move to tax tips step
      });

      res.json(suggestions);
    } catch (error) {
      console.error("Error generating tax suggestions:", error);
      res.status(500).json({ message: "Failed to generate tax suggestions" });
    }
  });

  // ITR generation route
  app.post('/api/generate-itr', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { taxSessionId, appliedSuggestions } = req.body;

      const taxSession = await storage.getTaxSession(taxSessionId);
      if (!taxSession || taxSession.userId !== userId) {
        return res.status(404).json({ message: "Tax session not found" });
      }

      const extractedData = taxSession.extractedData as any;
      if (!extractedData) {
        return res.status(400).json({ message: "No extracted data available" });
      }

      // Calculate final tax with applied suggestions
      const totalDeductions = (extractedData.deductions["80C"] || 0) + 
                             (appliedSuggestions?.elss || 0) + 
                             (appliedSuggestions?.healthInsurance || 0) + 
                             (appliedSuggestions?.nps || 0);

      const taxableIncome = Math.max(0, extractedData.grossSalary - extractedData.standardDeduction - totalDeductions);
      const calculatedTax = calculateIncomeTax(taxableIncome);
      const refund = Math.max(0, extractedData.tdsDeducted - calculatedTax);

      const itrData = {
        personalInfo: {
          name: extractedData.name,
          pan: extractedData.pan,
          address: "To be filled by taxpayer",
          dateOfBirth: "To be filled by taxpayer",
        },
        incomeDetails: {
          salaryIncome: extractedData.grossSalary,
          standardDeduction: extractedData.standardDeduction,
          taxableIncome,
        },
        deductions: {
          section80C: (extractedData.deductions["80C"] || 0) + (appliedSuggestions?.elss || 0),
          section80D: (extractedData.deductions["80D"] || 0) + (appliedSuggestions?.healthInsurance || 0),
          section80CCD1B: appliedSuggestions?.nps || 0,
        },
        taxDetails: {
          taxPayable: calculatedTax,
          tdsDeducted: extractedData.tdsDeducted,
          refundDue: refund,
        },
        generatedAt: new Date().toISOString(),
        financialYear: extractedData.financialYear,
      };

      await storage.updateTaxSession(taxSessionId, {
        itrData,
        currentStep: 9, // Final step
        isCompleted: true,
      });

      res.json(itrData);
    } catch (error) {
      console.error("Error generating ITR:", error);
      res.status(500).json({ message: "Failed to generate ITR" });
    }
  });

  // Chatbot route
  app.post('/api/taxbot/chat', isAuthenticated, async (req: any, res) => {
    try {
      const { question } = req.body;

      // Mock chatbot responses
      const responses = {
        "what is elss": "ELSS (Equity Linked Savings Scheme) are special mutual funds that qualify for tax deduction under Section 80C. Think of them as investing in companies while saving tax! You can invest up to ₹1.5 lakh per year and save tax up to ₹46,800. The money is locked for 3 years, but historically ELSS funds have given good returns.",
        "80c vs 80d": "80C and 80D are different tax-saving sections:\n\n80C: Saves tax on investments like PPF, ELSS, life insurance (up to ₹1.5 lakh)\n80D: Saves tax on health insurance premiums (up to ₹25,000 for self)\n\nYou can use both! They're separate limits, so you can save tax on both investments and health insurance.",
        "itr deadline": "The ITR filing deadline for FY 2023-24 is July 31, 2024. If you miss this, you can still file a belated return till December 31, 2024, but you might face penalties. It's always better to file on time!",
        "default": "I'm here to help with all your tax questions! You can ask me about:\n• Tax-saving investments (80C, 80D)\n• ITR filing process\n• Deductions and exemptions\n• How to calculate tax\n• Investment suggestions\n\nWhat would you like to know?"
      };

      const normalizedQuestion = question.toLowerCase();
      let response = responses.default;

      for (const [key, value] of Object.entries(responses)) {
        if (normalizedQuestion.includes(key.replace(/\s+/g, ' '))) {
          response = value;
          break;
        }
      }

      res.json({
        question,
        response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Failed to process chat" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function calculateIncomeTax(taxableIncome: number): number {
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
