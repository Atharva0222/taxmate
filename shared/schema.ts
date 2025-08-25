import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - updated for simple database auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  email: varchar("email").unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tax filing sessions table
export const taxSessions = pgTable("tax_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  financialYear: varchar("financial_year").notNull(),
  currentStep: integer("current_step").default(1),
  isCompleted: boolean("is_completed").default(false),
  onboardingData: jsonb("onboarding_data"),
  extractedData: jsonb("extracted_data"),
  taxCalculations: jsonb("tax_calculations"),
  taxSuggestions: jsonb("tax_suggestions"),
  itrData: jsonb("itr_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Form 16 uploads table
export const form16Uploads = pgTable("form16_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taxSessionId: varchar("tax_session_id").notNull().references(() => taxSessions.id),
  fileName: varchar("file_name").notNull(),
  fileUrl: varchar("file_url").notNull(),
  extractedData: jsonb("extracted_data"),
  processingStatus: varchar("processing_status").default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type TaxSession = typeof taxSessions.$inferSelect;
export type InsertTaxSession = typeof taxSessions.$inferInsert;

export type Form16Upload = typeof form16Uploads.$inferSelect;
export type InsertForm16Upload = typeof form16Uploads.$inferInsert;

export const createTaxSessionSchema = createInsertSchema(taxSessions).pick({
  financialYear: true,
  onboardingData: true,
});

export const updateTaxSessionSchema = createInsertSchema(taxSessions).pick({
  currentStep: true,
  onboardingData: true,
  extractedData: true,
  taxCalculations: true,
  taxSuggestions: true,
  itrData: true,
  isCompleted: true,
}).partial();

export const createForm16UploadSchema = createInsertSchema(form16Uploads).pick({
  taxSessionId: true,
  fileName: true,
  fileUrl: true,
});

// Auth schemas
export const signupSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;
