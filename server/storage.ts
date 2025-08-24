import {
  users,
  taxSessions,
  form16Uploads,
  type User,
  type UpsertUser,
  type TaxSession,
  type InsertTaxSession,
  type Form16Upload,
  type InsertForm16Upload,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Tax session operations
  createTaxSession(data: InsertTaxSession): Promise<TaxSession>;
  getTaxSession(id: string): Promise<TaxSession | undefined>;
  getTaxSessionByUser(userId: string, financialYear: string): Promise<TaxSession | undefined>;
  updateTaxSession(id: string, data: Partial<TaxSession>): Promise<TaxSession>;
  
  // Form 16 operations
  createForm16Upload(data: InsertForm16Upload): Promise<Form16Upload>;
  getForm16Upload(id: string): Promise<Form16Upload | undefined>;
  getForm16UploadsBySession(taxSessionId: string): Promise<Form16Upload[]>;
  updateForm16Upload(id: string, data: Partial<Form16Upload>): Promise<Form16Upload>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private taxSessions: Map<string, TaxSession>;
  private form16Uploads: Map<string, Form16Upload>;

  constructor() {
    this.users = new Map();
    this.taxSessions = new Map();
    this.form16Uploads = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...existingUser,
      ...userData,
      id: userData.id || randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Tax session operations
  async createTaxSession(data: InsertTaxSession): Promise<TaxSession> {
    const id = randomUUID();
    const taxSession: TaxSession = {
      ...data,
      id,
      currentStep: data.currentStep || 1,
      isCompleted: data.isCompleted || false,
      onboardingData: data.onboardingData || null,
      extractedData: data.extractedData || null,
      taxCalculations: data.taxCalculations || null,
      taxSuggestions: data.taxSuggestions || null,
      itrData: data.itrData || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.taxSessions.set(id, taxSession);
    return taxSession;
  }

  async getTaxSession(id: string): Promise<TaxSession | undefined> {
    return this.taxSessions.get(id);
  }

  async getTaxSessionByUser(userId: string, financialYear: string): Promise<TaxSession | undefined> {
    return Array.from(this.taxSessions.values()).find(
      session => session.userId === userId && session.financialYear === financialYear
    );
  }

  async updateTaxSession(id: string, data: Partial<TaxSession>): Promise<TaxSession> {
    const existing = this.taxSessions.get(id);
    if (!existing) {
      throw new Error("Tax session not found");
    }
    const updated: TaxSession = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.taxSessions.set(id, updated);
    return updated;
  }

  // Form 16 operations
  async createForm16Upload(data: InsertForm16Upload): Promise<Form16Upload> {
    const id = randomUUID();
    const upload: Form16Upload = {
      ...data,
      id,
      processingStatus: "pending",
      extractedData: null,
      createdAt: new Date(),
    };
    this.form16Uploads.set(id, upload);
    return upload;
  }

  async getForm16Upload(id: string): Promise<Form16Upload | undefined> {
    return this.form16Uploads.get(id);
  }

  async getForm16UploadsBySession(taxSessionId: string): Promise<Form16Upload[]> {
    return Array.from(this.form16Uploads.values()).filter(
      upload => upload.taxSessionId === taxSessionId
    );
  }

  async updateForm16Upload(id: string, data: Partial<Form16Upload>): Promise<Form16Upload> {
    const existing = this.form16Uploads.get(id);
    if (!existing) {
      throw new Error("Form 16 upload not found");
    }
    const updated: Form16Upload = {
      ...existing,
      ...data,
    };
    this.form16Uploads.set(id, updated);
    return updated;
  }
}

export class DatabaseStorage implements IStorage {
  // User operations - required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        email: userData.email || null,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: userData.profileImageUrl || null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email || null,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          profileImageUrl: userData.profileImageUrl || null,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Tax session operations
  async createTaxSession(data: InsertTaxSession): Promise<TaxSession> {
    const [taxSession] = await db
      .insert(taxSessions)
      .values({
        ...data,
        currentStep: data.currentStep || 1,
        isCompleted: data.isCompleted || false,
        onboardingData: data.onboardingData || null,
        extractedData: data.extractedData || null,
        taxCalculations: data.taxCalculations || null,
        taxSuggestions: data.taxSuggestions || null,
        itrData: data.itrData || null,
      })
      .returning();
    return taxSession;
  }

  async getTaxSession(id: string): Promise<TaxSession | undefined> {
    const [taxSession] = await db.select().from(taxSessions).where(eq(taxSessions.id, id));
    return taxSession || undefined;
  }

  async getTaxSessionByUser(userId: string, financialYear: string): Promise<TaxSession | undefined> {
    const [taxSession] = await db
      .select()
      .from(taxSessions)
      .where(and(eq(taxSessions.userId, userId), eq(taxSessions.financialYear, financialYear)));
    return taxSession || undefined;
  }

  async updateTaxSession(id: string, data: Partial<TaxSession>): Promise<TaxSession> {
    const [taxSession] = await db
      .update(taxSessions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(taxSessions.id, id))
      .returning();
    return taxSession;
  }

  // Form 16 operations
  async createForm16Upload(data: InsertForm16Upload): Promise<Form16Upload> {
    const [upload] = await db
      .insert(form16Uploads)
      .values({
        ...data,
        processingStatus: "pending",
        extractedData: null,
      })
      .returning();
    return upload;
  }

  async getForm16Upload(id: string): Promise<Form16Upload | undefined> {
    const [upload] = await db.select().from(form16Uploads).where(eq(form16Uploads.id, id));
    return upload || undefined;
  }

  async getForm16UploadsBySession(taxSessionId: string): Promise<Form16Upload[]> {
    return await db
      .select()
      .from(form16Uploads)
      .where(eq(form16Uploads.taxSessionId, taxSessionId));
  }

  async updateForm16Upload(id: string, data: Partial<Form16Upload>): Promise<Form16Upload> {
    const [upload] = await db
      .update(form16Uploads)
      .set(data)
      .where(eq(form16Uploads.id, id))
      .returning();
    return upload;
  }
}

export const storage = new DatabaseStorage();
