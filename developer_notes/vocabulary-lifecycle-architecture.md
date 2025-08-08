# Comprehensive Content & Vocabulary Lifecycle: Architecture & Implementation Plan

## 1. Overview & Core Principles

This document outlines the complete, refined architecture for the IFLA standards content lifecycle. It replaces previous plans with a more robust, scalable, and maintainable model based on our recent analysis.

The core philosophy is built on three key principles:

1.  **Clear Separation of Concerns**: The workflow distinguishes between structured data entry (Google Sheets), prose authoring (TinaCMS), and the final published artifact (Vocabulary Server). This ensures the right tool is used for the right job.
2.  **Git as the Single Source of Truth**: Once content is imported, the Git repository becomes the canonical source for all information. All changes, whether from editors or automated processes, are tracked and versioned.
3.  **Continuous Integration & Feedback**: A nightly assembly process provides constant feedback on the state of the vocabulary, minimizing last-minute surprises and ensuring data integrity throughout the editorial cycle.

---

## 2. Personas & Roles

-   **Administrator**: Responsible for initiating new editorial cycles, managing user access, and executing the final publication step.
-   **Editor**: Responsible for the day-to-day authoring and editing of both structured data (via the initial import) and instructional prose (via TinaCMS).

---

## 3. The End-to-End Content Lifecycle

The lifecycle is divided into four distinct phases, from initiation to publication.

### Phase 1: Cycle Kick-off (The "Bootstrap")

This phase is a one-time, administrator-triggered event to start a new version of a standard or create a new one.

-   **Trigger**: An Administrator navigates to the `/dashboard` and clicks "Start New Editorial Cycle" for a specific namespace (e.g., "ISBD").
-   **Process**:
    1.  The UI prompts the admin to either create a new standard from a template or revise an existing one.
    2.  If revising, the system calls an API to export the latest published RDF for that namespace into a new Google Sheet.
    3.  The Google Sheet is shared with the editorial team. Editors perform a one-time, bulk update of the structured data.
    4.  When complete, an Editor or Admin triggers the "Import from Sheet" process via the dashboard.
    5.  A Render API endpoint is invoked (**`POST /api/cycle/import`**). This function:
        a. Fetches all data from the specified Google Sheet.
        b. Validates the data row-by-row against the shared `@ifla/validation` library.
        c. Converts the validated data into RDF.
        d. Generates or overwrites the `docs/*.mdx` files, embedding the RDF into the front matter.
        e. Flags all changed pages as "Draft" or "Needs Review" in the system.
-   **Output**: The Git repository is updated with a complete set of MDX files representing the new baseline for the editorial cycle. The Google Sheet is now considered "stale" and is locked from further imports for this cycle.

### Phase 2: Incremental Editing (The Daily Workflow)

This is the continuous, day-to-day work of the editorial team.

-   **Trigger**: An Editor logs into the portal and navigates to a page.
-   **Process**:
    1.  The editor uses the TinaCMS UI to modify content.
    2.  **Prose Editing**: The main body of the MDX file is edited using the standard rich-text editor.
    3.  **Structured Data Editing**: The RDF data in the front matter is edited using custom, user-friendly forms within the TinaCMS sidebar.
    4.  When the editor clicks "Save," TinaCMS initiates a commit.
    5.  A server-side hook (e.g., **`POST /api/tina/validateOnSave`**) is triggered *before* the commit is finalized. This API endpoint uses the shared `@ifla/validation` library to validate the front matter changes.
-   **Output**: A new commit is made to the Git repository with the validated changes. If validation fails, the commit is rejected, and the editor sees a clear error message in the UI.

### Phase 3: Nightly Assembly (Continuous Integration)

This is an automated, offline process that provides daily feedback.

-   **Trigger**: A scheduled GitHub Action runs nightly.
-   **Process**:
    1.  The job checks out the latest `main` branch.
    2.  It executes the **`nx affected --target=harvest`** command.
    3.  A script (`scripts/nightly-assembly.ts`) runs on the affected files:
        a. It reads the front matter from each changed MDX file.
        b. It assembles the harvested RDF into a "draft" vocabulary file (e.g., `/output/nightly-build/isbd.ttl`).
        c. It runs an AI-assisted evaluation, comparing the new draft against the last *published* version.
-   **Output**:
    1.  The draft vocabulary files in the `/output/nightly-build/` directory are updated.
    2.  A **`SEMANTIC_IMPACT_REPORT.md`** file is generated and committed to the repository, making it viewable in the admin dashboard.

### Phase 4: Publication (The Release)

This is the final, administrator-triggered event to publish a new version.

-   **Trigger**: An Administrator, after reviewing the `SEMANTIC_IMPACT_REPORT.md` and getting team approval, navigates to the "Publish" section of the admin dashboard.
-   **Process**:
    1.  The UI displays the suggested semantic version (e.g., `v1.3.0`). The admin can confirm or override this.
    2.  The admin clicks "Publish Version `v1.3.0`".
    3.  A Render API endpoint is invoked (**`POST /api/publish`**). This is a lightweight function that:
        a. Takes the pre-assembled draft vocabulary from the latest nightly build.
        b. Assigns the confirmed version number to the artifact.
        c. Creates a new Git tag for the source code commit.
        d. Pushes the final, versioned RDF files to the official vocabulary server.
-   **Output**: A new, official version of the standard's vocabulary is published and available to the public. The cycle is now complete.

---

## 4. Technical Implementation Details

### UI/UX Design Suggestions

-   **Admin Dashboard (`/dashboard`)**:
    -   Should feature a main `Card` component for each namespace.
    -   Each card should display the status ("In Progress," "Published"), the date of the last update, and the suggested next semantic version from the nightly report.
    -   A "Start New Cycle" `Button` should open a `Dialog` that guides the admin through the bootstrap process.
    -   A "Publish" `Button` should be present, which becomes active only when the team has approved the changes.
-   **Nightly Report Viewer (`/dashboard/report`)**:
    -   A clean, read-only page that renders the `SEMANTIC_IMPACT_REPORT.md` file.
    -   It should clearly show the version impact (Major, Minor, Patch) and a diff of the changes.
-   **TinaCMS Editor UI**:
    -   Front matter editing should use clear, well-labeled forms, not raw text editing.
    -   Validation feedback must be immediate and user-friendly. On a failed save, the specific fields with errors should be highlighted directly in the form, with clear messages explaining what needs to be fixed.

### API Endpoint Definitions (`apps/admin`)

-   `POST /api/cycle/import`
    -   **Purpose**: To start the "Bootstrap" phase.
    -   **Request Body**: `{ "namespace": "isbd", "spreadsheetId": "...", "sheetName": "..." }`
    -   **Auth**: Administrator only.
    -   **Response**: `{ "success": true, "filesCreated": 85, "warnings": [...] }`
-   `POST /api/tina/validateOnSave`
    -   **Purpose**: Server-side validation hook for TinaCMS.
    -   **Request Body**: `{ "filePath": "...", "frontmatter": {...} }`
    -   **Auth**: Editor or Administrator.
    -   **Response**: `{ "isValid": true }` or `{ "isValid": false, "errors": [...] }`
-   `POST /api/publish`
    -   **Purpose**: To execute the final, lightweight publication step.
    -   **Request Body**: `{ "namespace": "isbd", "version": "v1.3.0" }`
    -   **Auth**: Administrator only.
    -   **Response**: `{ "success": true, "publishedUrl": "..." }`

### Required Scripts & Automation

-   `scripts/bootstrap-cycle.ts`:
    -   Connects to the Google Sheets API.
    -   Fetches and parses sheet data.
    -   Invokes the `@ifla/validation` library.
    -   Generates MDX files with front matter.
-   `scripts/nightly-assembly.ts`:
    -   Uses `nx affected` to get a list of changed files.
    -   Parses front matter from the affected files.
    -   Assembles the draft RDF vocabulary.
    -   Runs the AI-powered semantic version comparison.
    -   Generates the impact report.
-   `scripts/publish-vocabulary.ts`:
    -   Retrieves the draft vocabulary from the nightly build output.
    -   Applies the final version number.
    -   Pushes the artifacts to the vocabulary server.

### Nx Workflow Configuration

To manage this, we will define custom targets in the `project.json` files for the relevant applications (e.g., `portal`).

**Example `portal/project.json`:**
```json
{
  "name": "portal",
  "targets": {
    ...
    "harvest": {
      "executor": "nx:run-script",
      "options": {
        "script": "nightly-assembly"
      }
    },
    "validate-rdf": {
      "executor": "nx:run-script",
      "options": {
        "script": "validate-all-rdf" 
      }
    },
    "publish-vocab": {
      "executor": "nx:run-script",
      "options": {
        "script": "publish-vocabulary"
      }
    }
  }
}
```

This allows for commands like:
-   `nx harvest portal`: To manually trigger a harvest for the portal.
-   `nx affected --target=harvest`: The command the nightly GitHub Action will run.

---

## 5. Data Flow Diagram

```
[Google Sheet] -> (1. Admin Triggers Import API) -> [Render API: /api/cycle/import]
    |
    -> (Converts & Validates)
    |
    -> [MDX files in Git w/ RDF Front Matter]
        ^
        | (2. Editor Saves via TinaCMS)
        |
        -> [Render API: /api/tina/validateOnSave] -> (Validates) -> [Commit to Git]
            ^
            | (3. Nightly GitHub Action)
            |
            -> [Nx Affected Harvest Script] -> (Assembles RDF & Generates Report) -> [Draft Vocabulary & Impact Report]
                                                                                        |
                                                                                        | (4. Admin Triggers Publish API)
                                                                                        |
                                                                                        -> [Render API: /api/publish] -> [Final Vocabulary Server]
```

This comprehensive plan provides a resilient, scalable, and transparent foundation for managing your standards content.
