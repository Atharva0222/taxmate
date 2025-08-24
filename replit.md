# Overview

EZTaxMate is an AI-powered web application designed to simplify income tax return (ITR-1) filing for newly joined employees in India (0-3 years experience). The app uses AI to automatically extract data from Form 16 documents, provides beginner-friendly explanations of tax terms, offers personalized tax-saving suggestions, and generates completed ITR-1 JSON files for download. The application features a step-by-step wizard interface with progress tracking and includes an optional AI chatbot (TaxBot) for user queries.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **File Uploads**: Custom file upload component with drag-and-drop support

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth using OpenID Connect with Passport.js
- **Session Management**: Express sessions with PostgreSQL session store
- **File Processing**: Multer for file upload handling
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development

## Database Design
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless database driver
- **Tables**:
  - `users`: User profile information
  - `sessions`: Session storage for authentication
  - `tax_sessions`: Tax filing sessions with progress tracking
  - `form16_uploads`: Form 16 file uploads and processing status
- **Data Types**: JSONB columns for flexible storage of onboarding data, extracted tax data, calculations, and suggestions

## Authentication & Authorization
- **Provider**: Replit Auth with Google OAuth integration
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Security**: HTTP-only cookies with secure flags for production
- **User Management**: Automatic user creation and profile updates on authentication

## File Processing Workflow
- **Upload**: Secure file upload with validation (PDF, JPG, PNG up to 10MB)
- **OCR**: Mock OCR service for Form 16 data extraction (ready for real AI integration)
- **Validation**: File type and size validation with user feedback
- **Storage**: Temporary file storage with metadata tracking

## AI Integration Points
- **Form 16 OCR**: Placeholder for AI-powered document text extraction
- **Tax Calculations**: Mock service for tax computation and optimization
- **Investment Suggestions**: AI-generated personalized tax-saving recommendations
- **Chatbot**: TaxBot integration points for AI-powered tax assistance
- **Explanations**: "Explain like I'm 5" feature for complex tax terms

## Progress Tracking System
- **Wizard Steps**: 9-step tax filing process with visual progress indicators
- **State Persistence**: Tax session state saved across user sessions
- **Step Validation**: Each step validates required data before progression
- **Mobile Responsive**: Adaptive navigation for different screen sizes

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations with migration support

## Authentication Services
- **Replit Auth**: OpenID Connect authentication provider
- **Google OAuth**: Social login integration through Replit Auth

## UI Component Libraries
- **Radix UI**: Headless, accessible UI primitives for complex components
- **Lucide React**: Icon library for consistent iconography
- **TanStack Query**: Server state management and caching

## Development Tools
- **Vite**: Fast build tool with TypeScript support and hot module replacement
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **React Hook Form**: Form validation and state management
- **Zod**: TypeScript-first schema validation

## File Processing
- **Multer**: Node.js middleware for handling multipart/form-data file uploads
- **Built-in File Validation**: Custom validation for file types and sizes

## Production Services (Ready for Integration)
- **OpenAI GPT API**: For AI-powered OCR, tax calculations, and chatbot responses
- **Cloud Storage**: For secure Form 16 document storage
- **Email Services**: For user notifications and ITR-1 delivery
- **Analytics**: For tracking user progress and optimization