# Requirements Document

## Introduction

This document outlines the requirements for integrating the OMR25 vocabulary management system into the existing IFLA Standards Platform. The core strategy is to enhance the `apps/admin` Next.js application to serve as the central hub for all vocabulary lifecycle tasks, from import and validation to versioning and publication.

This approach leverages the modern, scalable Nx monorepo architecture while incorporating the robust, user-centric workflows defined in the OMR25 specification. The Docusaurus sites will continue to be the public-facing documentation layer, consuming the versioned, validated data managed through the new admin portal interfaces.

## Requirements

### Requirement 1: Core Vocabulary Management

**User Story:** As an Editor, I want to import a vocabulary from a spreadsheet, so that I can efficiently perform bulk updates to structured data.

#### Acceptance Criteria

1. WHEN an editor uploads a valid spreadsheet and confirms the import THEN the system SHALL parse the data, create or update the corresponding vocabulary files in the Git repository, and display a success message with a link to the changes
2. WHEN an editor uploads a spreadsheet with validation errors THEN the system SHALL reject the import, display a detailed error report linking errors to specific rows and columns, and NOT modify any vocabulary files
3. WHEN an editor modifies a term in the vocabulary form and clicks "Save" THEN the system SHALL validate the changes against the DCTAP profile, update the corresponding MDX front matter in Git, and provide immediate visual confirmation

### Requirement 2: Administrative Management

**User Story:** As an Administrator, I want to manage DCTAP validation profiles for each project, so that we can enforce data quality standards.

#### Acceptance Criteria

1. WHEN an administrator uploads a new DCTAP profile for a project THEN the system SHALL store it and make it available for all subsequent vocabulary validation within that project
2. WHEN an administrator views the validation profiles THEN the system SHALL display all active profiles with their associated projects and last modified dates
3. WHEN an administrator deletes a validation profile THEN the system SHALL confirm the action and prevent its use in future validations

### Requirement 3: Versioning and Publication Workflows

**User Story:** As an Editor, I want to create a new version of a vocabulary, so that I can publish a stable, citable release of our standard.

#### Acceptance Criteria

1. WHEN an editor initiates the "Publish Version" workflow THEN the system SHALL display a summary of changes, suggest a semantic version number, and await confirmation
2. WHEN an editor confirms the publication THEN the system SHALL generate the final RDF artifacts, create a corresponding GitHub Release and tag, and update the vocabulary's status to "Published"
3. WHEN a user selects two versions to compare THEN the system SHALL display a diff view highlighting added, modified, and removed terms and properties

### Requirement 4: Translation Management

**User Story:** As a Translator, I want a dedicated workspace to translate vocabulary terms and definitions, so that I can work efficiently without needing to understand the underlying data structure.

#### Acceptance Criteria

1. WHEN a translator navigates to the translation workspace for a specific language THEN the system SHALL display a table of source terms and their corresponding empty or existing translations
2. WHEN a translator saves their changes THEN the system SHALL store the translations in a structured format associated with the vocabulary, ready for the next publication cycle
3. WHEN a translator views incomplete translations THEN the system SHALL highlight missing or outdated translations requiring attention

### Requirement 5: Batch Operations

**User Story:** As an Administrator, I want to export multiple vocabularies from a namespace into a single workbook, so that I can perform offline reviews or backups.

#### Acceptance Criteria

1. WHEN an administrator selects several vocabularies and triggers a batch export THEN the system SHALL generate a multi-sheet Excel file and provide it as a download
2. WHEN an administrator initiates a batch import operation THEN the system SHALL process multiple vocabularies sequentially and provide a consolidated status report
3. WHEN batch operations are running THEN the system SHALL display progress indicators and allow cancellation of pending operations

### Requirement 6: Integration with Docusaurus Sites

**User Story:** As a Documentation Author, I want the public-facing Docusaurus sites to automatically reflect the latest published vocabulary data, so that the documentation is always synchronized with the standard.

#### Acceptance Criteria

1. WHEN a new vocabulary version is published THEN the Docusaurus site's build process SHALL automatically use the new data to generate its pages
2. WHEN vocabulary data is updated THEN the system SHALL trigger appropriate build processes for affected Docusaurus sites
3. WHEN a Docusaurus site builds THEN it SHALL consume only published, validated vocabulary data from the Git repository

### Requirement 7: Data Validation and Quality Assurance

**User Story:** As an Editor, I want comprehensive validation feedback during vocabulary editing, so that I can ensure data quality before publication.

#### Acceptance Criteria

1. WHEN an editor enters invalid data in a vocabulary form THEN the system SHALL provide immediate, contextual validation feedback
2. WHEN validation errors occur during import THEN the system SHALL provide detailed error reports with row and column references
3. WHEN a vocabulary passes all validation checks THEN the system SHALL indicate readiness for publication with a clear status indicator

### Requirement 8: User Access Control and Security

**User Story:** As an Administrator, I want role-based access control for vocabulary management features, so that we can maintain data integrity and security.

#### Acceptance Criteria

1. WHEN a user attempts to access vocabulary management features THEN the system SHALL verify their role and permissions through Cerbos authorization
2. WHEN unauthorized access is attempted THEN the system SHALL deny access and log the attempt for security monitoring
3. WHEN user roles change THEN the system SHALL immediately reflect the new permissions in the vocabulary management interface

### Requirement 9: Performance and Scalability

**User Story:** As a System User, I want vocabulary management operations to be performant and responsive, so that I can work efficiently with large datasets.

#### Acceptance Criteria

1. WHEN processing large vocabulary imports THEN the system SHALL use background jobs and provide progress feedback to maintain UI responsiveness
2. WHEN multiple users access the system simultaneously THEN the system SHALL maintain acceptable response times for all operations
3. WHEN vocabulary data grows in size THEN the system SHALL continue to perform efficiently through optimized data structures and caching

### Requirement 10: Audit Trail and Change Tracking

**User Story:** As an Administrator, I want complete audit trails of all vocabulary changes, so that we can track modifications and maintain accountability.

#### Acceptance Criteria

1. WHEN any vocabulary modification occurs THEN the system SHALL record the change, user, timestamp, and nature of the modification
2. WHEN administrators review audit logs THEN the system SHALL provide searchable, filterable views of all vocabulary-related activities
3. WHEN changes need to be reverted THEN the system SHALL provide mechanisms to identify and undo specific modifications