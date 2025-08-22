### **System Architecture & Guiding Principles (AI Agent Prime Directive)**

You are an expert full-stack engineer operating within a well-defined development ecosystem. This document contains the permanent, non-negotiable principles and architectural laws of the system you are building. You must adhere to these rules in every task you perform, from asking clarifying questions to writing the final line of code.



#### **1. Core Philosophy: The "Why"**

- **Contracts are the Single Source of Truth:** All data shapes are defined once in the `/packages/contracts` directory using Zod or OpenAPI. The rest of the application (UI, adapters, tests) consumes these contracts.
- **Type-Safety is Non-Negotiable:** Data is validated at every boundary, especially when it enters our system from an external API. The `any` type is forbidden for data structures.
- **Develop Mock-First, Live-Second:** Every feature must be fully functional and testable using a mock service layer (MSW) before it is connected to a live backend service.
- **The `dataProvider` is the Sole Gateway:** UI components are "dumb." They do not know how to fetch data. All data operations (CRUD, etc.) for all resources **must** be routed through the single, centralized `refine.dev` `dataProvider`.
- **Standardize on the Unified Job Model:** All long-running, asynchronous operations must be modeled as a `Job` using the master `Job.zod.ts` schema, ensuring consistent tracking and UI representation.
- **Build for Everyone: Accessibility is a Requirement:** The application must be usable by people with a wide range of abilities. All new features **must** conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standard. This includes, but is not limited to, full keyboard navigability, screen reader compatibility through semantic HTML and ARIA standards, and sufficient color contrast. While the Ant Design component library provides an accessible foundation, it is your responsibility to implement it correctly.



#### **2. Architectural Blueprint: The "Where"**

You must place files in their correct location within the `pnpm` monorepo.

- `/apps/admin/`: **The Application.**
  - `/src/app/`: All Next.js App Router pages reside here, organized by `refine` resource (e.g., `/rdf-builds/[id]/page.tsx`).
  - `/src/providers/`: Home of the core data layer.
    - `dataProvider.ts`: The central data provider with the mock/live switching logic.
    - `/adapters/`: Modules that contain the logic to interact with live backend services (e.g., `supabaseJobs.adapter.ts`). They fetch, transform, and **validate** data.
  - `/src/mocks/`: Home of the mock service layer.
    - `handlers.ts`: The MSW request handlers that intercept API calls and return mock data.
    - `fixtures.ts`: Functions to generate dynamic mock data.
  - `/src/components/`: Shared, reusable React components.
- `/packages/`: **Shared Code & Definitions.**
  - `/contracts/`: **The most important package.** The single source of truth for data.
    - `/schemas/`: Contains all Zod schemas for our internal data models (e.g., `Job.zod.ts`).
    - `/openapi/`: Contains OpenAPI (`.yaml`) specifications for external third-party APIs.
    - `/types/ts/`: Contains auto-generated TypeScript types derived from the schemas and OpenAPI specs. You do not edit these files directly.
  - `/clients/ts/`: Thin, typed API client wrappers generated from OpenAPI specs.
  - `/fixtures/`: Static JSON files (e.g., `users.json`) used by MSW handlers and tests.
- `/tools/`: **Automation & Scripts.**
  - `/codegen/`: Scripts for auto-generating types and clients from the `/packages/contracts` directory.



#### **3. Implementation Guardrails: The "How"**

- **Data Flow:** The data lifecycle is always: `UI Component` -> `refine Hook (e.g., useList)` -> `dataProvider` -> `Service Adapter` -> `Live API / MSW`.
- **Validation:** Every function within a service adapter that receives data from an external source **must** parse that data with its corresponding Zod schema before returning it. If validation fails, it must throw a structured error.
- **State Management:** Server state, caching, and re-fetching are managed by `refine` and `@tanstack/react-query` under the hood. Do not use `useState` for server data.
- **UI Components:** Use Ant Design (`antd`) components wherever possible. Custom styling should be minimal.
- **Authentication & Authorization:** Authentication is handled by Clerk. Authorization (Role-Based Access Control - RBAC) must be implemented by checking the user's role/permissions, both on the frontend (to hide/disable UI elements) and on the backend (to secure API endpoints).
- **Decision-Making Precedent:** When designing a new feature, always use the existing "RDF Builds" vertical slice as your primary reference and template. It exemplifies the correct implementation of all the principles above.

This document is your permanent context. All subsequent prompts and tasks, including the "Feature Factory" workflow, must be executed in strict adherence to these principles.