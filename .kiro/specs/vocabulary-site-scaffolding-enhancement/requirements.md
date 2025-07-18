# Requirements Document

## Introduction

The vocabulary site scaffolding system generates navigation sidebars that reference individual element sets and vocabulary pages, but doesn't create these files. This causes "document ids do not exist" build errors. The page template generator needs to create the files that the navigation references.

## Requirements

### Requirement 1: Create Element Set Pages

**User Story:** As a site user, I want to navigate to individual element sets so that I can browse their elements.

#### Acceptance Criteria

1. WHEN generating pages THEN the system SHALL create `docs/elements/{element-set-id}/index.mdx` for each element set
2. WHEN creating element set pages THEN they SHALL include title, description, and element count
3. WHEN element set directories are created THEN they SHALL support auto-indexing for individual elements

### Requirement 2: Create Vocabulary Pages  

**User Story:** As a site user, I want to navigate to individual vocabularies so that I can view their concepts.

#### Acceptance Criteria

1. WHEN generating pages THEN the system SHALL create `docs/vocabularies/{vocabulary-id}.mdx` for each vocabulary
2. WHEN creating vocabulary pages THEN they SHALL include title, description, and concept count
3. WHEN vocabulary pages are created THEN they SHALL hold the vocabulary content directly (no subdirectories)

### Requirement 3: Create Documentation Pages

**User Story:** As a site user, I want comprehensive documentation pages so that I can learn about the standard.

#### Acceptance Criteria

1. WHEN generating pages THEN the system SHALL create all documentation pages referenced in the sidebar:
   - `docs/introduction.mdx` - Introduction to the standard
   - `docs/examples.mdx` - Usage examples
   - `docs/about.mdx` - About the standard
   - `docs/assessment.mdx` - Assessment guidelines
   - `docs/glossary.mdx` - Terminology glossary
   - Any other documentation pages referenced in the navigation
2. WHEN creating documentation pages THEN they SHALL include appropriate placeholder content
3. WHEN documentation pages are created THEN they SHALL follow the same structure and formatting as ISBD

### Requirement 4: Match Navigation Structure

**User Story:** As a site maintainer, I want builds to succeed so that the site works correctly.

#### Acceptance Criteria

1. WHEN the navigation generator creates sidebar entries THEN all referenced document IDs SHALL exist as files
2. WHEN building sites THEN there SHALL be no "document ids do not exist" errors