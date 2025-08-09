# Admin UI and API Specification

**Version:** 1.0  
**Date:** July 2025  
**Status:** Comprehensive Specification  
**Purpose:** Complete admin interface and API endpoint documentation

## Executive Summary

This document consolidates all admin UI screens and API endpoints required for the IFLA Standards Platform admin portal based on the accumulated system design documentation. The specification covers authentication, user management, project management, vocabulary lifecycle, translation workflows, and system administration.

**Key Addition**: Projects are now first-class components that create distinct workflows for managing namespace updates, with comprehensive GitHub integration for issues, pull requests, and project boards - all manageable through a local UI without requiring users to navigate to GitHub.

## Admin UI Structure

### Global Navigation Architecture

#### Personal Navigation Bar (Persistent)
- **Location**: Top of all admin pages
- **Purpose**: Context-aware global navigation tailored to user's roles and permissions
- **Persistence**: Remains consistent across all admin activities and page views

#### Navigation Personalization
The global navbar dynamically adapts based on:
- System role (superadmin, review group admin, member)
- Review group memberships and roles within them
- Active project assignments
- Namespace access permissions
- Current working context (selected namespace/project)

#### Dynamic Navigation Components

**1. For System Administrators**
- **System** dropdown menu:
  - Platform Settings
  - User Management
  - All Review Groups
  - System Monitoring
  - Deployment Control
- **Quick Actions**: Create Review Group, Invite Admin, System Backup

**2. For Review Group Administrators**
- **Review Groups** dropdown (their groups only):
  - Group Dashboard
  - Team Management
  - Namespace Settings
  - Charter Project
- **Projects** dropdown (their review group's projects)
- **Quick Actions**: Create Project, Invite Member, Start Import

**3. For Project Members**
- **My Projects** dropdown:
  - Active project dashboards
  - Project boards
  - Team communications
- **Namespaces** dropdown (accessible ones only)
- **Quick Actions**: Create Issue, Submit PR

**4. Common Elements for All Users**
- **Logo/Home**: Link to personal dashboard
- **Context Switcher**: 
  - Current namespace indicator
  - Quick namespace/project switcher
- **User Menu**:
  - Profile settings
  - My Activity
  - Preferences
  - Sign out
- **Notifications** bell icon with count
- **Help** dropdown:
  - Documentation
  - Keyboard shortcuts
  - Support

#### Context Awareness Features
- **Breadcrumb Trail**: Shows hierarchical location
- **Active Context Badge**: Displays current namespace/project
- **Role Indicator**: Visual indication of user's highest role
- **Environment Indicator**: Preview/Production/Demo mode

#### Responsive Behavior
- **Desktop**: Full horizontal navigation with all dropdowns
- **Tablet**: Condensed navigation with grouped menus
- **Mobile**: Hamburger menu with slide-out navigation panel

### UI/UX Design Patterns

#### Navigation Architecture
1. **Left Sidebar Navigation** (Domain Selection)
   - Fixed left sidebar for primary domain navigation
   - Icons with labels for major sections
   - Collapsible for more screen space
   - Active state highlighting
   - Grouped by functional area

2. **Tabbed Sub-Navigation** (Sub-domain Selection)
   - Horizontal tabs within content area
   - Used when domain has multiple sub-sections
   - Lazy loading of tab content
   - Tab state persistence in URL

3. **DataTable Patterns**
   - **Top Action Bar**:
     - Bulk action buttons (Delete Selected, Export, Import)
     - Search/filter controls
     - View toggle (table/card/list)
     - Column visibility controls
   - **Row-Level Actions**:
     - Action icon button (three dots or gear)
     - Dropdown menu with contextual actions
     - Common actions: Edit, View, Delete, Clone, Archive
   - **Table Features**:
     - Sortable columns
     - Pagination controls
     - Row selection with checkboxes
     - Inline editing where appropriate

#### MUI Component Standards
- **Navigation**: `Drawer`, `List`, `ListItem`, `ListItemButton`, `ListItemIcon`
- **Tabs**: `Tabs`, `Tab`, `TabPanel` with `Box` containers
- **Tables**: `DataGrid` (MUI X) for complex tables, `Table` for simple ones
- **Actions**: `IconButton` with `Menu` and `MenuItem` for dropdowns
- **Forms**: `TextField`, `Select`, `Autocomplete`, `DatePicker`
- **Feedback**: `Alert`, `Snackbar`, `Dialog` for confirmations
- **Layout**: `Grid` v2, `Stack`, `Box`, `Container`

#### MUI DataGrid Features to Utilize
- **Column Features**: Sorting, filtering, resizing, reordering, pinning
- **Row Features**: Selection with checkboxes, expandable rows, row grouping
- **Cell Features**: Custom renderers, inline editing, validation
- **Advanced Features**: 
  - Virtual scrolling for large datasets
  - CSV export functionality
  - Column visibility panel
  - Density selector (compact/standard/comfortable)
  - Custom toolbar with action buttons
  - Footer with aggregations
- **Styling**: Striped rows, hover states, custom cell styling based on data

### Accessibility Requirements (EU/GB Compliance)

#### Legal Compliance
- **EU**: Web Accessibility Directive (WAD) 2016/2102 - WCAG 2.1 Level AA
- **UK**: Public Sector Bodies Accessibility Regulations 2018
- **Standard**: WCAG 2.1 Level AA minimum (working towards AAA where possible)

#### Navigation Accessibility
1. **Keyboard Navigation**:
   - All interactive elements accessible via Tab key
   - Skip navigation links at page start
   - Logical tab order (left sidebar → main content → actions)
   - Escape key closes menus/dialogs
   - Arrow keys navigate within menus and tables

2. **Screen Reader Support**:
   - Proper ARIA labels for all controls
   - ARIA landmarks for page regions
   - Live regions for dynamic updates
   - Descriptive button labels (not just icons)
   - Table headers properly associated with cells

3. **Focus Management**:
   - Visible focus indicators (min 2px outline)
   - Focus trapped in modals/dialogs
   - Focus returns to trigger element on close
   - Focus moves to new content on page changes

#### DataTable Accessibility
1. **Table Structure**:
   ```tsx
   <DataGrid
     aria-label="Users table"
     getRowId={(row) => row.id}
     columns={[
       { 
         field: 'actions',
         headerName: 'Actions',
         renderCell: (params) => (
           <IconButton
             aria-label={`Actions for ${params.row.name}`}
             onClick={handleClick}
           >
             <MoreVertIcon />
           </IconButton>
         )
       }
     ]}
   />
   ```

2. **Row Actions**:
   - Action buttons must have descriptive aria-labels
   - Menu items must be keyboard navigable
   - Status changes announced to screen readers

3. **Bulk Actions**:
   - Clear indication of selected items count
   - Keyboard shortcuts for select all (Ctrl+A)
   - Confirmation dialogs for destructive actions

#### Form Accessibility
1. **Labels and Instructions**:
   - All inputs have associated labels
   - Required fields marked with aria-required
   - Error messages linked via aria-describedby
   - Help text associated with fields

2. **Error Handling**:
   ```tsx
   <TextField
     id="email"
     label="Email Address"
     error={!!errors.email}
     helperText={errors.email}
     required
     aria-required="true"
     aria-invalid={!!errors.email}
     aria-describedby={errors.email ? "email-error" : "email-helper"}
   />
   ```

#### Color and Contrast
1. **Contrast Requirements**:
   - Normal text: 4.5:1 contrast ratio
   - Large text (18pt+): 3:1 contrast ratio
   - UI components: 3:1 contrast ratio
   - Focus indicators: 3:1 against adjacent colors

2. **Color Independence**:
   - Never rely on color alone to convey information
   - Use icons, patterns, or text labels alongside color
   - Status indicators include text labels

#### Responsive and Zoom
1. **Responsive Design**:
   - Content reflows at 320px width
   - No horizontal scrolling up to 400% zoom
   - Touch targets minimum 44x44px on mobile

2. **Text Scaling**:
   - Support up to 200% browser zoom
   - Text remains readable at all zoom levels
   - Layout doesn't break with larger text

#### Accessible Component Patterns

1. **Left Sidebar Navigation**:
   ```tsx
   <Drawer
     variant="permanent"
     aria-label="Main navigation"
   >
     <nav role="navigation" aria-label="Primary navigation">
       <List>
         <ListItem>
           <ListItemButton
             aria-current={isActive ? "page" : undefined}
             aria-label="Dashboard"
           >
             <ListItemIcon>
               <DashboardIcon aria-hidden="true" />
             </ListItemIcon>
             <ListItemText primary="Dashboard" />
           </ListItemButton>
         </ListItem>
       </List>
     </nav>
   </Drawer>
   ```

2. **Tab Navigation**:
   ```tsx
   <Tabs
     value={tabValue}
     onChange={handleChange}
     aria-label="Namespace management tabs"
   >
     <Tab label="Overview" id="tab-0" aria-controls="tabpanel-0" />
     <Tab label="Content" id="tab-1" aria-controls="tabpanel-1" />
   </Tabs>
   <TabPanel value={tabValue} index={0} id="tabpanel-0" aria-labelledby="tab-0">
     {/* Tab content */}
   </TabPanel>
   ```

3. **Action Menus**:
   ```tsx
   <IconButton
     aria-label="More actions for user John Doe"
     aria-controls={open ? 'user-menu' : undefined}
     aria-haspopup="true"
     aria-expanded={open ? 'true' : undefined}
     onClick={handleClick}
   >
     <MoreVertIcon />
   </IconButton>
   <Menu
     id="user-menu"
     aria-labelledby="More actions menu"
     anchorEl={anchorEl}
     open={open}
     onClose={handleClose}
   >
     <MenuItem onClick={handleEdit}>Edit User</MenuItem>
     <MenuItem onClick={handleDelete}>Delete User</MenuItem>
   </Menu>
   ```

### Left Sidebar Navigation Structure

#### System Admin Sidebar
```
🏠 Dashboard
👥 Users & Access
📋 Review Groups  
📁 Projects
📦 Namespaces
📚 Vocabularies
🔄 Translations
📊 Reports
⚙️ System Settings
```

#### Review Group Admin Sidebar
```
🏠 Dashboard
👥 Team Members
📁 Our Projects
📦 Our Namespaces
📚 Vocabularies
🔄 Translations
📊 Reports
⚙️ RG Settings
```

#### Project Member Sidebar
```
🏠 Dashboard
📁 My Projects
📦 Accessible Namespaces
📚 Assigned Tasks
🔔 Notifications
👤 My Profile
```

### 1. Authentication & Authorization

#### Login Screen
- **Path**: `/admin/auth/signin`
- **Purpose**: GitHub OAuth authentication entry point
- **Components**:
  - IFLA branding
  - "Sign in with GitHub" button
  - Error message display
  - Return URL handling for post-login redirect

#### Session Management
- **Path**: `/admin/auth/session`
- **Purpose**: Validate and refresh user sessions
- **Components**:
  - Session timeout warnings
  - Automatic refresh mechanism
  - Force logout option

### 2. Dashboard & Overview

#### Main Dashboard
- **Path**: `/admin/dashboard`
- **Purpose**: Central hub for all admin activities
- **Components**:
  - User welcome message with role display
  - Quick stats cards:
    - Active namespaces count
    - Pending reviews count
    - Recent vocabulary updates
    - Active translation tasks
  - Recent activity feed
  - Quick action buttons based on user role
  - System health indicators

#### Review Group Dashboard
- **Path**: `/admin/review-groups/:rgId/dashboard`
- **Purpose**: Review group-specific overview
- **Components**:
  - Review group statistics
  - Namespace list with status
  - Team member overview
  - Recent project activity
  - Pending approvals queue

### 3. User & Role Management

#### User List
- **Path**: `/admin/users`
- **Purpose**: Browse and manage platform users
- **Layout Pattern**:
  - Left sidebar: Admin navigation (Users selected)
  - Main content: No tabs needed (single view)
- **DataTable Implementation**:
  - **Top Actions**: 
    - "Invite Users" button
    - "Export Users" button
    - Search bar with filters (role, status, review group)
  - **Columns**: Name, Email, Role, Review Groups, Status, Last Active
  - **Row Actions** (via IconButton menu):
    - Edit Permissions
    - View Activity
    - Send Message
    - Suspend/Activate
    - Remove from Platform
  - **Bulk Actions**: Export selected, Send bulk email

#### User Detail/Edit
- **Path**: `/admin/users/:userId`
- **Purpose**: View and modify user permissions
- **Components**:
  - User profile information
  - GitHub account linkage
  - Role assignment matrix:
    - System roles (superadmin)
    - Review group roles
    - Team memberships
    - Translation permissions
  - Activity history
  - Audit log for this user

### 4. Review Group Management

#### Review Group List
- **Path**: `/admin/review-groups`
- **Purpose**: Manage all review groups
- **Components**:
  - Review group cards/table
  - Create new review group button
  - Status indicators
  - Member counts

#### Review Group Detail
- **Path**: `/admin/review-groups/:rgId`
- **Purpose**: Manage specific review group
- **Components**:
  - Review group information editor
  - Admin management
  - Namespace association
  - Team management
  - GitHub team integration status

### 5. Namespace Management

#### Namespace List
- **Path**: `/admin/namespaces`
- **Purpose**: Overview of all namespaces
- **Layout Pattern**:
  - Left sidebar: Admin navigation (Namespaces selected)
  - Main content: No tabs (single view)
- **DataTable Implementation**:
  - **Top Actions**:
    - "Create Namespace" button
    - "Import from Legacy" button
    - Filter by review group, status
    - Search by name/code
  - **Columns**: Name, Code, Review Group, Version, Elements, Status, Last Updated
  - **Row Actions** (via IconButton menu):
    - Manage Content
    - View Statistics
    - Configure Settings
    - Export Data
    - Archive Namespace

#### Namespace Detail
- **Path**: `/admin/namespaces/:nsId`
- **Purpose**: Manage individual namespace
- **Layout Pattern**:
  - Left sidebar: Namespace-specific navigation
  - Main content: Tabbed interface
- **Tab Structure**:
  1. **Overview Tab**:
     - Namespace statistics cards
     - Recent activity feed
     - Quick actions
  2. **Content Tab**:
     - DataTable of elements/vocabularies
     - Top actions: Add Element, Import CSV, Export
     - Row actions: Edit, Preview, Delete, History
  3. **Versions Tab**:
     - DataTable of versions
     - Top actions: Create Version, Compare Versions
     - Row actions: View, Publish, Rollback, Download
  4. **Team Tab**:
     - DataTable of team members
     - Top actions: Add Member, Manage Roles
     - Row actions: Edit Role, Remove, View Activity
  5. **Settings Tab**:
     - Form-based configuration
     - Sections for metadata, permissions, integrations

### 6. Project Management

#### Project List
- **Path**: `/admin/projects`
- **Purpose**: Manage all active projects across review groups
- **Layout Pattern**:
  - Left sidebar: Admin navigation (Projects selected)
  - Main content: Toggle between DataTable and Card view
- **DataTable Implementation**:
  - **Top Actions**:
    - "Charter New Project" button (primary)
    - View toggle (Table/Cards)
    - Filters: Review Group, Status, Timeline
    - Search by project name
  - **Columns**: 
    - Project Name (with progress bar)
    - Review Group
    - Lead
    - Team (avatar group)
    - Status (chip)
    - Issues/PRs (badges)
    - Timeline
    - Completion %
  - **Row Actions** (via IconButton menu):
    - Open Dashboard
    - Edit Charter
    - Manage Team
    - View Board
    - Archive Project
    - Export Report
  - **Card View Alternative**:
    - Project cards with key metrics
    - Kanban-style status columns
    - Drag to change status

#### Project Detail/Dashboard
- **Path**: `/admin/projects/:projectId`
- **Purpose**: Comprehensive project management hub
- **Components**:
  - Project charter display/editor
  - Kanban board (synced with GitHub Projects)
  - Team management
  - Namespace assignments
  - Timeline/roadmap view
  - Activity feed
  - Quick actions (create issue, PR, discussion)

#### Project Charter Editor
- **Path**: `/admin/projects/:projectId/charter`
- **Purpose**: Define and update project scope
- **Components**:
  - Scope definition editor
  - Deliverables checklist
  - Timeline with milestones
  - Success criteria
  - Team composition
  - Namespace permissions matrix
  - Approval workflow

#### Project Board
- **Path**: `/admin/projects/:projectId/board`
- **Purpose**: Kanban-style task management
- **Components**:
  - Customizable columns (Backlog, In Progress, Review, Done)
  - Drag-and-drop cards
  - Quick issue creation
  - Filters (assignee, label, milestone)
  - Progress visualization
  - Burndown charts
  - GitHub sync status

#### Issue Management
- **Path**: `/admin/projects/:projectId/issues`
- **Purpose**: Local issue tracking synced with GitHub
- **Components**:
  - Issue list with filters
  - Quick create with templates
  - Bulk actions
  - Label management
  - Assignment controls
  - Priority indicators
  - GitHub sync status

#### Pull Request Dashboard
- **Path**: `/admin/projects/:projectId/pulls`
- **Purpose**: Review and manage pull requests
- **Components**:
  - PR list grouped by status
  - Review assignment
  - Merge conflict indicators
  - CI/CD status
  - Quick review actions
  - Diff preview
  - Comment threads

#### Project Analytics
- **Path**: `/admin/projects/:projectId/analytics`
- **Purpose**: Project health and progress metrics
- **Components**:
  - Velocity charts
  - Contributor statistics
  - Issue/PR trends
  - Milestone progress
  - Time tracking
  - Bottleneck identification

### 7. Issue & Feedback Management

#### Global Issue Dashboard
- **Path**: `/admin/issues`
- **Purpose**: Cross-project issue management
- **Components**:
  - Unified issue view
  - Advanced filters
  - Triage queue
  - Auto-categorization
  - Duplicate detection
  - Bulk operations

#### Issue Templates
- **Path**: `/admin/issues/templates`
- **Purpose**: Manage issue templates
- **Components**:
  - Template editor
  - Category management
  - Field configuration
  - Preview mode
  - Usage analytics

#### Feedback Portal
- **Path**: `/admin/feedback`
- **Purpose**: Manage public feedback
- **Components**:
  - Feedback inbox
  - Sentiment analysis
  - Auto-categorization
  - Response templates
  - Conversion to issues
  - Metrics dashboard

### 8. Pull Request Management

#### Global PR Dashboard
- **Path**: `/admin/pulls`
- **Purpose**: Organization-wide PR overview
- **Components**:
  - PR queue by review group
  - Review assignments
  - Merge readiness indicators
  - Conflict resolution tools
  - Batch operations

#### PR Review Interface
- **Path**: `/admin/pulls/:prId/review`
- **Purpose**: Comprehensive PR review
- **Components**:
  - File diff viewer
  - Inline commenting
  - Suggestion mode
  - Approval workflow
  - CI/CD results
  - Merge controls

### 9. Discussion Management

#### Discussion Forums
- **Path**: `/admin/discussions`
- **Purpose**: Manage project discussions
- **Components**:
  - Discussion categories
  - Moderation queue
  - Pinned topics
  - Search functionality
  - Participation metrics

### 10. Vocabulary & Content Management

#### Content Management Dashboard
- **Path**: `/admin/namespaces/:nsId/content`
- **Purpose**: Comprehensive content management interface
- **Components**:
  - Create new page wizard
  - Scaffold element pages from CSV
  - Scaffold vocabulary pages from CSV
  - Example management (add, edit, organize)
  - Navigation/sidebar organization
  - Content status overview

#### RDF Management
- **Path**: `/admin/namespaces/:nsId/rdf`
- **Purpose**: RDF conversion and management tools
- **Components**:
  - CSV to RDF converter
  - RDF to CSV extractor
  - Google Sheets sync interface
  - RDF validation against DCTAP
  - DCTAP profile editor
  - JSON-LD context management
  - RDF release generation

#### Vocabulary Import
- **Path**: `/admin/vocabularies/import`
- **Purpose**: Import vocabularies from spreadsheets
- **Components**:
  - Google Sheets connection
  - File upload (Excel/CSV)
  - Validation preview
  - Column mapping interface
  - Import progress tracker

#### MDX Generation Control
- **Path**: `/admin/vocabularies/generate`
- **Purpose**: Generate MDX from vocabulary data
- **Components**:
  - Namespace selector
  - Source selector (spreadsheet/RDF)
  - Dry-run preview toggle
  - Generation options
  - Progress indicator
  - Result preview with diff

#### Vocabulary Validation
- **Path**: `/admin/vocabularies/validate`
- **Purpose**: Validate vocabulary data
- **Components**:
  - Validation rule selector
  - Error/warning display
  - Fix suggestions
  - Batch fix actions
  - Export validation report

#### Quality Assurance Dashboard
- **Path**: `/admin/namespaces/:nsId/quality`
- **Purpose**: Quality checks and validation
- **Components**:
  - Link validation checker
  - Terminology consistency checker
  - WCAG accessibility audit
  - Translation status overview
  - Performance testing interface
  - Cross-reference validator

### 11. Translation Management

#### Translation Overview
- **Path**: `/admin/translations`
- **Purpose**: Monitor translation progress
- **Layout Pattern**:
  - Left sidebar: Admin navigation (Translations selected)
  - Main content: Tabbed by workflow type
- **Tab Structure**:
  1. **All Translations Tab**:
     - DataTable with language/namespace matrix
     - Top actions: Start New Translation, Export Status Report
     - Cell content: Progress bars with percentages
     - Cell actions: View Details, Assign Translator
  2. **Active Workflows Tab**:
     - DataTable of in-progress translations
     - Columns: Namespace, Language, Translator, Progress, Deadline, Status
     - Top actions: Bulk Assign, Export to Sheets
     - Row actions: View/Edit, Reassign, Set Deadline, Cancel
  3. **Vocabulary Translations Tab**:
     - Specialized view for RDF term translations
     - Grouped by namespace with expandable rows
     - Inline editing capabilities
  4. **Import/Export Tab**:
     - File upload area for bulk imports
     - Export configuration form
     - Recent import/export history table

#### Translation Workflow
- **Path**: `/admin/translations/:nsId/:lang`
- **Purpose**: Manage specific translation
- **Components**:
  - Version-based sync controls
  - Google Sheets export button
  - Import validation
  - Progress tracking
  - Quality checks

### 12. Publishing & Versioning

#### Release Management
- **Path**: `/admin/releases`
- **Purpose**: Control vocabulary releases
- **Components**:
  - Draft versions list
  - AI-powered version recommendations
  - Changelog editor
  - Review checklist
  - Publish controls
  - Rollback options

#### Namespace Release Center
- **Path**: `/admin/namespaces/:nsId/releases`
- **Purpose**: Namespace-specific release management
- **Components**:
  - Create release candidate
  - Generate release notes
  - Export PDF documentation
  - Tag stable releases
  - Deploy to production controls
  - Release history timeline

#### Version History
- **Path**: `/admin/namespaces/:nsId/versions`
- **Purpose**: Browse version history
- **Components**:
  - Version timeline
  - Diff viewer
  - Download options
  - Restore controls
  - Tag management

### 13. Workflow Management

#### Review Workflow Dashboard
- **Path**: `/admin/namespaces/:nsId/workflow`
- **Purpose**: Manage content review workflows
- **Components**:
  - Review queue management
  - Reviewer assignment interface
  - Deadline tracking calendar
  - Content status by workflow stage
  - Merge approved changes controls
  - Workflow analytics

#### Repository Statistics
- **Path**: `/admin/namespaces/:nsId/stats`
- **Purpose**: Detailed repository analytics
- **Components**:
  - Contribution graphs
  - Code frequency charts
  - Commit activity timeline
  - Contributor statistics
  - Language breakdown
  - Repository health metrics

### 14. Namespace Settings & Configuration

#### Namespace Settings
- **Path**: `/admin/namespaces/:nsId/settings`
- **Purpose**: Configure namespace-specific settings
- **Components**:
  - Namespace metadata editor
  - Navigation configuration
  - Theme and branding settings
  - Deployment configuration
  - Backup and restore controls
  - Import/export settings

### 15. Backup & Recovery

#### Backup Management
- **Path**: `/admin/backups`
- **Purpose**: Manage system backups
- **Components**:
  - Backup list with timestamps
  - Manual backup trigger
  - Retention policy editor
  - Restore interface
  - Backup size indicators

#### Rollback Center
- **Path**: `/admin/rollback`
- **Purpose**: Execute rollback operations
- **Components**:
  - Rollback target selector
  - Preview changes
  - Confirmation workflow
  - Progress tracker
  - Audit trail

### 16. System Administration

#### TinaCMS Configuration
- **Path**: `/admin/system/tina`
- **Purpose**: Configure TinaCMS integration
- **Components**:
  - Enable/disable per namespace
  - Preview URL configuration
  - Component registration
  - Permission mapping
  - Cache controls

#### API Configuration
- **Path**: `/admin/system/api`
- **Purpose**: Manage API settings
- **Components**:
  - Rate limit configuration
  - CORS settings
  - API key management
  - Webhook configuration
  - Usage statistics

#### Audit Log Viewer
- **Path**: `/admin/audit`
- **Purpose**: Review system activity
- **Components**:
  - Searchable audit log
  - Filter by user, action, date
  - Detail view
  - Export functionality
  - Retention settings

## API Endpoints

### Authentication & Authorization

```typescript
// Authentication
POST   /api/admin/auth/signin          // Initiate GitHub OAuth
GET    /api/admin/auth/callback        // OAuth callback handler
GET    /api/admin/auth/session         // Get current session
POST   /api/admin/auth/signout         // End session
POST   /api/admin/auth/refresh         // Refresh session token

// Authorization
GET    /api/admin/users/me             // Get current user with permissions
GET    /api/admin/users/me/permissions // Get detailed permission matrix
```

### User Management

```typescript
// User CRUD
GET    /api/admin/users                // List users (paginated)
GET    /api/admin/users/:userId        // Get user details
PUT    /api/admin/users/:userId        // Update user
DELETE /api/admin/users/:userId        // Remove user

// Role Management
PUT    /api/admin/users/:userId/roles  // Update user roles
POST   /api/admin/users/:userId/teams  // Add to team
DELETE /api/admin/users/:userId/teams/:teamId // Remove from team
```

### Review Group Management

```typescript
// Review Group CRUD
GET    /api/admin/review-groups        // List review groups
POST   /api/admin/review-groups        // Create review group
GET    /api/admin/review-groups/:rgId  // Get review group details
PUT    /api/admin/review-groups/:rgId  // Update review group
DELETE /api/admin/review-groups/:rgId  // Delete review group

// Review Group Members
GET    /api/admin/review-groups/:rgId/members    // List members
POST   /api/admin/review-groups/:rgId/members    // Add member
DELETE /api/admin/review-groups/:rgId/members/:userId // Remove member

// Review Group Resources
GET    /api/admin/review-groups/:rgId/namespaces // List namespaces
POST   /api/admin/review-groups/:rgId/namespaces // Create namespace
GET    /api/admin/review-groups/:rgId/teams      // List teams
POST   /api/admin/review-groups/:rgId/teams      // Create team
```

### Namespace Management

```typescript
// Namespace CRUD
GET    /api/admin/namespaces           // List all namespaces
GET    /api/admin/namespaces/:nsId     // Get namespace details
PUT    /api/admin/namespaces/:nsId     // Update namespace
DELETE /api/admin/namespaces/:nsId     // Delete namespace

// Namespace Operations
POST   /api/admin/namespaces/:nsId/versions      // Create version
GET    /api/admin/namespaces/:nsId/versions      // List versions
POST   /api/admin/namespaces/:nsId/publish       // Publish version
POST   /api/admin/namespaces/:nsId/lock          // Lock for release
POST   /api/admin/namespaces/:nsId/unlock        // Unlock for editing
```

### Project Management

```typescript
// Project CRUD
GET    /api/admin/projects                        // List all projects
POST   /api/admin/projects                        // Create new project
GET    /api/admin/projects/:projectId             // Get project details
PUT    /api/admin/projects/:projectId             // Update project
DELETE /api/admin/projects/:projectId             // Delete project
POST   /api/admin/projects/:projectId/archive     // Archive project

// Project Charter
GET    /api/admin/projects/:projectId/charter     // Get project charter
PUT    /api/admin/projects/:projectId/charter     // Update charter
POST   /api/admin/projects/:projectId/charter/approve // Approve charter

// Project Teams
GET    /api/admin/projects/:projectId/teams       // List project teams
POST   /api/admin/projects/:projectId/teams       // Add team to project
PUT    /api/admin/projects/:projectId/teams/:teamId // Update team role
DELETE /api/admin/projects/:projectId/teams/:teamId // Remove team

// Project Members
GET    /api/admin/projects/:projectId/members     // List project members
POST   /api/admin/projects/:projectId/members     // Add member
PUT    /api/admin/projects/:projectId/members/:userId // Update member role
DELETE /api/admin/projects/:projectId/members/:userId // Remove member

// Project Boards (GitHub Projects sync)
GET    /api/admin/projects/:projectId/board       // Get board state
PUT    /api/admin/projects/:projectId/board       // Update board
POST   /api/admin/projects/:projectId/board/sync  // Sync with GitHub
GET    /api/admin/projects/:projectId/board/columns // Get columns
POST   /api/admin/projects/:projectId/board/columns // Create column
PUT    /api/admin/projects/:projectId/board/columns/:columnId // Update column
DELETE /api/admin/projects/:projectId/board/columns/:columnId // Delete column

// Project Cards
GET    /api/admin/projects/:projectId/cards       // List all cards
POST   /api/admin/projects/:projectId/cards       // Create card
PUT    /api/admin/projects/:projectId/cards/:cardId // Update card
DELETE /api/admin/projects/:projectId/cards/:cardId // Delete card
POST   /api/admin/projects/:projectId/cards/:cardId/move // Move card

// Project Analytics
GET    /api/admin/projects/:projectId/analytics   // Get project metrics
GET    /api/admin/projects/:projectId/velocity   // Velocity chart data
GET    /api/admin/projects/:projectId/burndown   // Burndown chart data
GET    /api/admin/projects/:projectId/contributors // Contributor stats
```

### Issue Management

```typescript
// Issues CRUD
GET    /api/admin/issues                          // List all issues
POST   /api/admin/issues                          // Create issue
GET    /api/admin/issues/:issueId                 // Get issue details
PUT    /api/admin/issues/:issueId                 // Update issue
DELETE /api/admin/issues/:issueId                 // Delete issue
POST   /api/admin/issues/:issueId/close          // Close issue
POST   /api/admin/issues/:issueId/reopen         // Reopen issue

// Issue Operations
POST   /api/admin/issues/:issueId/assign         // Assign issue
POST   /api/admin/issues/:issueId/labels         // Add labels
DELETE /api/admin/issues/:issueId/labels/:label  // Remove label
POST   /api/admin/issues/:issueId/comments       // Add comment
GET    /api/admin/issues/:issueId/timeline       // Get timeline
POST   /api/admin/issues/:issueId/convert        // Convert to PR

// Issue Templates
GET    /api/admin/issues/templates               // List templates
POST   /api/admin/issues/templates               // Create template
PUT    /api/admin/issues/templates/:templateId   // Update template
DELETE /api/admin/issues/templates/:templateId   // Delete template

// Issue Sync
POST   /api/admin/issues/sync                    // Sync with GitHub
GET    /api/admin/issues/sync/status             // Sync status
POST   /api/admin/issues/sync/conflicts          // Resolve conflicts
```

### Pull Request Management

```typescript
// Pull Request CRUD
GET    /api/admin/pulls                           // List all PRs
GET    /api/admin/pulls/:prId                     // Get PR details
PUT    /api/admin/pulls/:prId                     // Update PR
POST   /api/admin/pulls/:prId/close              // Close PR
POST   /api/admin/pulls/:prId/reopen             // Reopen PR
POST   /api/admin/pulls/:prId/merge              // Merge PR

// PR Reviews
GET    /api/admin/pulls/:prId/reviews            // List reviews
POST   /api/admin/pulls/:prId/reviews            // Request review
POST   /api/admin/pulls/:prId/reviews/:reviewId  // Submit review
PUT    /api/admin/pulls/:prId/reviews/:reviewId  // Update review

// PR Operations
GET    /api/admin/pulls/:prId/diff               // Get diff
GET    /api/admin/pulls/:prId/commits            // List commits
POST   /api/admin/pulls/:prId/comments          // Add comment
GET    /api/admin/pulls/:prId/checks             // CI/CD status
POST   /api/admin/pulls/:prId/sync              // Sync with GitHub
```

### Discussion Management

```typescript
// Discussions CRUD
GET    /api/admin/discussions                     // List discussions
POST   /api/admin/discussions                     // Create discussion
GET    /api/admin/discussions/:discussionId      // Get discussion
PUT    /api/admin/discussions/:discussionId      // Update discussion
DELETE /api/admin/discussions/:discussionId      // Delete discussion
POST   /api/admin/discussions/:discussionId/pin  // Pin discussion
POST   /api/admin/discussions/:discussionId/lock // Lock discussion

// Discussion Categories
GET    /api/admin/discussions/categories         // List categories
POST   /api/admin/discussions/categories         // Create category
PUT    /api/admin/discussions/categories/:catId  // Update category
DELETE /api/admin/discussions/categories/:catId  // Delete category

// Discussion Comments
GET    /api/admin/discussions/:discussionId/comments    // List comments
POST   /api/admin/discussions/:discussionId/comments    // Add comment
PUT    /api/admin/discussions/:discussionId/comments/:commentId // Edit comment
DELETE /api/admin/discussions/:discussionId/comments/:commentId // Delete comment
```

### Vocabulary & Content Management

```typescript
// Content Management
GET    /api/admin/namespaces/:nsId/content        // List content pages
POST   /api/admin/namespaces/:nsId/content/page   // Create new page
POST   /api/admin/namespaces/:nsId/content/scaffold/elements // Scaffold element pages
POST   /api/admin/namespaces/:nsId/content/scaffold/vocabularies // Scaffold vocabulary pages
GET    /api/admin/namespaces/:nsId/content/examples // List examples
POST   /api/admin/namespaces/:nsId/content/examples // Add example
PUT    /api/admin/namespaces/:nsId/content/examples/:exampleId // Update example
DELETE /api/admin/namespaces/:nsId/content/examples/:exampleId // Delete example
PUT    /api/admin/namespaces/:nsId/content/navigation // Update navigation

// RDF Management
POST   /api/admin/namespaces/:nsId/rdf/csv-to-rdf // Convert CSV to RDF
POST   /api/admin/namespaces/:nsId/rdf/rdf-to-csv // Extract CSV from RDF
POST   /api/admin/namespaces/:nsId/rdf/sheets/sync // Sync with Google Sheets
POST   /api/admin/namespaces/:nsId/rdf/validate   // Validate RDF
GET    /api/admin/namespaces/:nsId/rdf/dctap      // Get DCTAP profile
PUT    /api/admin/namespaces/:nsId/rdf/dctap      // Update DCTAP profile
PUT    /api/admin/namespaces/:nsId/rdf/context    // Update JSON-LD context
POST   /api/admin/namespaces/:nsId/rdf/release    // Generate RDF release

// Import/Export
POST   /api/admin/vocabularies/import             // Import from spreadsheet
POST   /api/admin/vocabularies/import/validate    // Validate import data
GET    /api/admin/vocabularies/export/:nsId       // Export to spreadsheet
POST   /api/admin/vocabularies/sheets/connect     // Connect Google Sheets
GET    /api/admin/vocabularies/sheets/:sheetId    // Get sheet data

// Generation
POST   /api/admin/vocabularies/generate           // Generate MDX
POST   /api/admin/vocabularies/generate/dry-run   // Preview generation
GET    /api/admin/vocabularies/generate/:jobId    // Get generation status
POST   /api/admin/vocabularies/generate/:jobId/cancel // Cancel generation

// Validation & Quality
POST   /api/admin/vocabularies/validate           // Validate vocabulary
GET    /api/admin/vocabularies/validation-rules   // Get available rules
POST   /api/admin/vocabularies/fix-suggestions    // Get fix suggestions
POST   /api/admin/namespaces/:nsId/quality/links  // Validate links
POST   /api/admin/namespaces/:nsId/quality/consistency // Check consistency
POST   /api/admin/namespaces/:nsId/quality/accessibility // Run accessibility audit
GET    /api/admin/namespaces/:nsId/quality/translation // Translation status
POST   /api/admin/namespaces/:nsId/quality/performance // Performance test
```

### Translation Management

```typescript
// Translation Workflows
GET    /api/admin/translations                    // Translation overview
GET    /api/admin/translations/:nsId              // Namespace translations
POST   /api/admin/translations/:nsId/export       // Export for translation
POST   /api/admin/translations/:nsId/import       // Import translations
GET    /api/admin/translations/:nsId/:lang        // Language-specific status
PUT    /api/admin/translations/:nsId/:lang        // Update translation

// Translation Sync
POST   /api/admin/translations/:nsId/sync         // Sync with spreadsheet
GET    /api/admin/translations/:nsId/sync/status  // Get sync status
POST   /api/admin/translations/:nsId/sync/resolve // Resolve conflicts

// Adopt Spreadsheet Workflow
POST   /api/admin/vocabularies/adopt              // Initiate spreadsheet adoption
POST   /api/admin/vocabularies/adopt/analyze      // Analyze spreadsheet structure
GET    /api/admin/vocabularies/adopt/:jobId       // Check adoption status
POST   /api/admin/vocabularies/adopt/validate     // Validate before adoption
POST   /api/admin/vocabularies/adopt/confirm      // Confirm and execute adoption
GET    /api/admin/vocabularies/adopt/templates    // Get available templates
```

### Publishing & Versioning

```typescript
// Release Management
GET    /api/admin/releases                        // List releases
POST   /api/admin/releases                        // Create release
GET    /api/admin/releases/:releaseId             // Get release details
POST   /api/admin/releases/:releaseId/publish     // Publish release
POST   /api/admin/releases/:releaseId/rollback    // Rollback release

// Namespace Releases
POST   /api/admin/namespaces/:nsId/releases/candidate // Create release candidate
POST   /api/admin/namespaces/:nsId/releases/notes    // Generate release notes
POST   /api/admin/namespaces/:nsId/releases/pdf      // Export PDF
POST   /api/admin/namespaces/:nsId/releases/tag      // Tag stable release
POST   /api/admin/namespaces/:nsId/releases/deploy   // Deploy to production
GET    /api/admin/namespaces/:nsId/releases          // List namespace releases

// Version Analysis
POST   /api/admin/versions/analyze                // AI version analysis
GET    /api/admin/versions/recommendations        // Get recommendations
POST   /api/admin/versions/changelog              // Generate changelog
```

### Workflow & Review Management

```typescript
// Review Workflows
GET    /api/admin/namespaces/:nsId/workflow/queue     // Get review queue
POST   /api/admin/namespaces/:nsId/workflow/assign    // Assign reviewers
GET    /api/admin/namespaces/:nsId/workflow/deadlines // Track deadlines
GET    /api/admin/namespaces/:nsId/workflow/status    // Content by stage
POST   /api/admin/namespaces/:nsId/workflow/merge     // Merge approved changes
GET    /api/admin/namespaces/:nsId/workflow/analytics // Workflow analytics

// Repository Statistics
GET    /api/admin/namespaces/:nsId/stats              // Repository overview
GET    /api/admin/namespaces/:nsId/stats/contributions // Contribution graphs
GET    /api/admin/namespaces/:nsId/stats/commits      // Commit activity
GET    /api/admin/namespaces/:nsId/stats/languages    // Language breakdown
GET    /api/admin/namespaces/:nsId/stats/health       // Repository health

// Team Activity
GET    /api/admin/namespaces/:nsId/activity          // Recent activity
GET    /api/admin/namespaces/:nsId/activity/members  // Member activity
```

### Namespace Configuration

```typescript
// Settings Management
GET    /api/admin/namespaces/:nsId/settings         // Get settings
PUT    /api/admin/namespaces/:nsId/settings         // Update settings
PUT    /api/admin/namespaces/:nsId/settings/navigation // Navigation config
PUT    /api/admin/namespaces/:nsId/settings/theme   // Theme settings
PUT    /api/admin/namespaces/:nsId/settings/deployment // Deployment config
POST   /api/admin/namespaces/:nsId/settings/export  // Export settings
POST   /api/admin/namespaces/:nsId/settings/import  // Import settings
```

### Backup & Recovery

```typescript
// Backup Operations
GET    /api/admin/backups                         // List backups
POST   /api/admin/backups                         // Create backup
GET    /api/admin/backups/:backupId               // Get backup details
DELETE /api/admin/backups/:backupId               // Delete backup
POST   /api/admin/backups/:backupId/restore       // Restore from backup

// Namespace Backups
GET    /api/admin/namespaces/:nsId/backups        // List namespace backups
POST   /api/admin/namespaces/:nsId/backups        // Create namespace backup
POST   /api/admin/namespaces/:nsId/restore        // Restore namespace

// Rollback Operations
POST   /api/admin/rollback/preview                // Preview rollback
POST   /api/admin/rollback/execute                // Execute rollback
GET    /api/admin/rollback/history                // Rollback history
```

### System Administration

```typescript
// TinaCMS Management
GET    /api/admin/system/tina/config              // Get TinaCMS config
PUT    /api/admin/system/tina/config              // Update config
POST   /api/admin/system/tina/cache/clear         // Clear cache
GET    /api/admin/system/tina/status              // Get status

// API Management
GET    /api/admin/system/api/config               // Get API config
PUT    /api/admin/system/api/config               // Update config
GET    /api/admin/system/api/usage                // Usage statistics
POST   /api/admin/system/api/keys                 // Generate API key
DELETE /api/admin/system/api/keys/:keyId          // Revoke API key

// Audit & Monitoring
GET    /api/admin/audit/logs                      // Get audit logs
GET    /api/admin/audit/logs/:logId               // Get log details
POST   /api/admin/audit/export                    // Export audit logs
GET    /api/admin/system/health                   // Health check
GET    /api/admin/system/metrics                  // System metrics

// System Status Monitoring
GET    /api/admin/system/status                   // Get all service statuses
GET    /api/admin/system/status/:service          // Get specific service status
POST   /api/admin/system/status/refresh           // Force status refresh
```

### Utility Endpoints

```typescript
// Search & Autocomplete
GET    /api/admin/search                          // Global search
GET    /api/admin/autocomplete/users              // User autocomplete
GET    /api/admin/autocomplete/namespaces         // Namespace autocomplete
GET    /api/admin/autocomplete/teams              // Team autocomplete

// Notifications
GET    /api/admin/notifications                   // Get notifications
PUT    /api/admin/notifications/:notifId/read     // Mark as read
POST   /api/admin/notifications/preferences       // Update preferences

// Global Navigation Support
GET    /api/admin/navigation/menu                 // Get personalized navigation menu
GET    /api/admin/navigation/context             // Get current context (namespace/project)
PUT    /api/admin/navigation/context             // Set current context
GET    /api/admin/navigation/quickactions        // Get role-based quick actions
GET    /api/admin/navigation/switcher            // Get namespace/project switcher data

// Activity Feed
GET    /api/admin/activity/feed                   // Get activity feed items
GET    /api/admin/activity/feed/:type             // Filter by activity type
GET    /api/admin/activity/user/:userId           // Get user-specific activity
GET    /api/admin/activity/namespace/:nsId        // Get namespace activity
GET    /api/admin/activity/project/:projectId     // Get project activity
```

## Implementation Priorities

### Phase 1: Core Functionality (Weeks 1-2)
1. Authentication & authorization
2. User management
3. Basic dashboard
4. Review group management
5. Namespace CRUD

### Phase 2: Project Management (Weeks 3-4)
1. Project creation and charter management
2. GitHub Projects sync
3. Issue and PR management
4. Basic kanban boards
5. Team assignments

### Phase 3: Vocabulary Management (Weeks 5-6)
1. Spreadsheet import/export
2. MDX generation with dry-run
3. Validation framework
4. Basic versioning

### Phase 4: Advanced Features (Weeks 7-8)
1. Translation workflows
2. TinaCMS integration
3. Backup & rollback
4. Publishing pipeline

### Phase 5: Collaboration & Polish (Weeks 9-10)
1. Discussion forums
2. Advanced analytics
3. Audit logging
4. System monitoring
5. Performance optimization

## Security Considerations

### Authentication Requirements
- GitHub OAuth 2.0 only
- No local user accounts
- Session timeout after 8 hours
- Secure cookie handling

### Authorization Model
- Role-based access control (RBAC)
- Hierarchical permissions
- Review group isolation
- Audit all write operations

### API Security
- JWT tokens for all requests
- Rate limiting per user
- CORS configuration
- Input validation on all endpoints

## Accessibility Testing Requirements

### Testing Tools
1. **Automated Testing**:
   - axe DevTools for Chrome/Firefox
   - WAVE (WebAIM) browser extension
   - Lighthouse accessibility audit
   - Jest-axe for unit tests
   - Cypress-axe for E2E tests

2. **Manual Testing**:
   - Keyboard-only navigation
   - Screen readers: NVDA (Windows), JAWS, VoiceOver (macOS)
   - Browser zoom testing (up to 400%)
   - Color contrast analyzers

### Accessibility Checklist
- [ ] All functionality available via keyboard
- [ ] Tab order is logical and predictable
- [ ] Focus indicators visible on all interactive elements
- [ ] Skip navigation links present
- [ ] ARIA labels on all icon buttons
- [ ] Form labels associated with inputs
- [ ] Error messages linked to fields
- [ ] Color contrast meets WCAG AA (4.5:1 normal, 3:1 large text)
- [ ] Status messages announced to screen readers
- [ ] Modals trap focus appropriately
- [ ] Tables have proper headers and relationships
- [ ] Images have appropriate alt text
- [ ] Page has proper heading hierarchy
- [ ] Language attribute set on HTML element
- [ ] Responsive down to 320px width
- [ ] Works at 200% zoom without horizontal scroll

## Performance Requirements

### Response Times
- Dashboard load: <2 seconds
- API responses: <500ms average
- Search results: <1 second
- MDX generation: Progress updates every 5 seconds

### Scalability
- Support 100+ concurrent users
- Handle 10,000+ vocabulary terms
- Process 50MB spreadsheets
- Manage 100+ namespaces

## Conclusion

This specification provides a comprehensive blueprint for implementing the IFLA Standards Platform admin interface. With the addition of first-class project management features, the platform now offers a complete workflow system that integrates GitHub's collaboration tools directly into the admin UI. 

The design enables users to manage projects, issues, pull requests, and discussions without leaving the platform, while maintaining full synchronization with GitHub. This approach balances powerful functionality with usability and accessibility, ensuring that both technical and non-technical users, including those with disabilities, can effectively manage vocabulary data, translations, and collaborative workflows in a unified interface.

**Total Coverage**:
- 16 major UI sections with 60+ individual screens
- 170+ RESTful API endpoints
- Global personalized navigation system
- Left sidebar navigation with tabbed sub-domains
- MUI DataGrid tables with comprehensive row/bulk actions
- WCAG 2.1 Level AA accessibility compliance
- Complete GitHub integration for project management
- Comprehensive vocabulary lifecycle management
- Advanced collaboration features
- Real-time system monitoring
- Spreadsheet adoption workflow

**Key Design Principles**:
- Exclusive use of MUI components for consistency
- EU/GB accessibility regulations compliance
- Keyboard-first navigation design
- Screen reader optimized interface
- Responsive design supporting 320px to 4K displays
- Progressive enhancement for advanced features
