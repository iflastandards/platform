### **Backend & Integration Plan Generation (For AI Lead Engineer)**



**AI Agent Instructions:** You are the Lead Engineer operating within the "Feature Factory" workflow. You have just received the "UI approved" signal from the Product Owner in Phase 2. Your current task is to generate the backend and integration portion of the **Development Plan** for Phase 3.

Your response must be a precise, actionable checklist. Every item you generate must strictly adhere to the rules, file locations, and principles defined in your prime directive, the **"System Architecture & Guiding Principles"** document. You will use this plan to build the feature in Phase 4.

**Context:**

- **Current Workflow Phase:** Phase 3: Development Plan & Approval.
- **Input:** The finalized requirements from Phase 1 and the approved UI mockup from Phase 2.
- **Core Knowledge:** Your foundational "System Architecture & Guiding Principles" directive.
- **Output Goal:** A numbered list of backend-related tasks to be included in the full "Technical Task Checklist" that you will present to the Product Owner for approval.

------



### **Prompt:**



Based on the confirmed feature requirements, generate the backend and integration task list. For each task, provide a clear title and a brief description of the work to be done, including specific file paths where applicable.

**1. Update the Unified Job Model**

- **Task:** Extend the master `JobSchema` in `/packages/contracts/schemas/Job.zod.ts`.
- **Details:** Add a new, descriptive enum value to the `type` field to represent this new asynchronous operation. For example, for a CSV user import feature, add `'user_import_from_csv'`. This ensures the job conforms to our system-wide standard for asynchronous tasks.

**2. Define Data Contracts**

- **Task:** Create or update Zod schemas in `/packages/contracts/schemas/`.
- **Details:** Define the precise data shapes for any new entities and API request/response bodies. These schemas are the non-negotiable source of truth. If the feature involves a new external API with an OpenAPI spec, note its location in `/packages/contracts/openapi/`.

**3. Design API Endpoints (Supabase Edge Functions)**

- **Task:** Define the new REST API endpoints required to trigger and monitor the job.
- **Details:** For each endpoint, specify the HTTP Method, Path (e.g., `POST /api/jobs/enqueue/user-imports`), Request Body schema (referencing the contract from step 2), and expected Success/Error responses. These will be implemented as secure Supabase Edge Functions.

**4. Implement Live Service Adapter**

- **Task:** Create or update a service adapter function in `/apps/admin/src/providers/adapters/`.
- **Details:** This function will encapsulate the logic for calling the live API endpoint from step 3. Per our core principles, this function **must** parse the raw API response with the corresponding Zod schema before returning the data to the `dataProvider`. This is our type-safety guarantee.

**5. Implement MSW Mock Handlers**

- **Task:** Add corresponding request handlers to `/apps/admin/src/mocks/handlers.ts`.
- **Details:** To fulfill our "Mock-First" principle, create handlers that perfectly mirror the live API contract. The mock for the job creation endpoint must return a valid `Job` object. The mock for fetching job status must simulate a realistic asynchronous flow (e.g., `queued` -> `running` -> `success`/`failed`) using `ctx.delay()`.

**6. Create Fixtures**

- **Task:** Add static mock data to the `/packages/fixtures/` directory.
- **Details:** If the feature's list page requires mock data, create a new JSON file (e.g., `user-imports.json`) that the MSW handler can serve. The structure of the objects in this file must perfectly match the Zod schema.

**7. Define Backend Unit Tests**

- **Task:** Outline the necessary unit tests using Vitest.
- **Details:** Specify tests for the new Zod schemas to ensure they correctly validate good data and reject bad data. Outline tests for the new service adapter function, ensuring it correctly transforms and validates mock API responses.

You will present these tasks as a clear, numbered list. This list forms the backend-specific section of the complete "Technical Task Checklist" you will deliver to the Product Owner for the "Plan approved" gate.