# Admin Authorization Model

## Entity Hierarchy

### Top-Level Entities

#### Review Group (RG)
- **Has**: 
  - 1 to many namespaces
  - 0 to many projects
  - 0 to many teams
  - 1 to many members

#### Project
- **Has**:
  - 1 to many teams
  - 1 to many namespaces
  - 1 GitHub discussion

#### Namespace
- **Has**:
  - 0 to many element sets
  - 0 to many value vocabularies
  - 0 to many pages (instructions/examples/documentation)
  - 1 to many translations (always includes English)
  - 1 to many releases
  - GitHub issues
  - Spreadsheets

#### Element Sets
- Has documentation
- Has RDF

#### Value Vocabularies
- Has documentation
- Has RDF

#### Supporting Entities
- Instructions/Documentation Pages
- Translations
- Releases

## Role Definitions

### 1. Superadmin
- **Scope**: System-wide
- **Capabilities**: Unrestricted access to all system features
- **Key Activities**:
  - Manage all Review Groups
  - System configuration
  - User management across all RGs
  - Platform maintenance

### 2. RG Admin (Review Group Admin)
- **Scope**: Review Group level
- **Capabilities**: Full control within assigned Review Group(s)
- **Key Activities**:
  - Create/update/delete namespaces
  - Create/update/delete projects
  - Create/update/delete teams
  - Invite users to teams
  - Add/update/delete users from teams
  - Assign roles to team members
  - Assign teams and namespaces to projects
  - All Editor capabilities

### 3. Editor
- **Scope**: Team/Project level
- **Capabilities**: Content management within assigned teams/projects
- **Key Activities**:
  - Create/update/delete element sets
  - Create/update/delete value vocabularies
  - Manage translations
  - Manage releases
  - Import/export spreadsheets
  - Manage DCTAP (Dublin Core Tabular Application Profiles)
  - All Author capabilities
- **Note**: May have different roles on different teams

### 4. Author
- **Scope**: Content level
- **Capabilities**: Basic content editing
- **Key Activities**:
  - Edit spreadsheets
  - Edit documentation pages
  - Create/edit instructions and examples

### 5. Translator
- **Scope**: Language-specific
- **Capabilities**: Translation management
- **Key Activities**:
  - Edit translations in assigned language(s)
  - View source content (English)
  - Suggest translation improvements

## User Stories by Role

### Superadmin Stories

1. **System Management**
   - As a Superadmin, I can create new Review Groups so that new standards organizations can be onboarded
   - As a Superadmin, I can assign RG Admins to Review Groups so that they can manage their content
   - As a Superadmin, I can view system-wide analytics so that I can monitor platform usage

2. **User Management**
   - As a Superadmin, I can impersonate any user role so that I can troubleshoot issues
   - As a Superadmin, I can disable/enable user accounts so that I can manage platform access
   - As a Superadmin, I can export user activity logs so that I can audit system usage

### RG Admin Stories

1. **Namespace Management**
   - As an RG Admin, I can create new namespaces so that we can organize different standards
   - As an RG Admin, I can archive old namespaces so that we maintain historical records
   - As an RG Admin, I can set namespace visibility so that we control public/private access

2. **Project Management**
   - As an RG Admin, I can create projects that span multiple namespaces so that we can coordinate work
   - As an RG Admin, I can link GitHub discussions to projects so that we have integrated communication
   - As an RG Admin, I can assign teams to projects so that work is properly distributed

3. **Team Management**
   - As an RG Admin, I can create teams with specific focuses so that we can organize contributors
   - As an RG Admin, I can invite external contributors so that we can expand our contributor base
   - As an RG Admin, I can set team permissions so that access is appropriately restricted

### Editor Stories

1. **Content Management**
   - As an Editor, I can create new element sets so that we can define metadata standards
   - As an Editor, I can import spreadsheets so that we can bulk update vocabularies
   - As an Editor, I can create new releases so that we can publish stable versions

2. **Workflow Management**
   - As an Editor, I can assign content for review so that quality is maintained
   - As an Editor, I can revert changes so that we can fix mistakes
   - As an Editor, I can compare versions so that we can track changes

3. **Integration Management**
   - As an Editor, I can export to RDF so that our data is machine-readable
   - As an Editor, I can manage GitHub issues so that we track work items
   - As an Editor, I can generate DCTAP profiles so that we have proper documentation

### Author Stories

1. **Content Creation**
   - As an Author, I can edit spreadsheet cells so that I can update vocabulary terms
   - As an Author, I can add examples to documentation so that users understand usage
   - As an Author, I can preview my changes so that I can verify my work

2. **Documentation**
   - As an Author, I can create new documentation pages so that we have comprehensive guides
   - As an Author, I can link between pages so that users can navigate easily
   - As an Author, I can embed code examples so that technical details are clear

### Translator Stories

1. **Translation Management**
   - As a Translator, I can see untranslated content so that I know what needs work
   - As a Translator, I can suggest alternative translations so that we improve quality
   - As a Translator, I can mark translations for review so that native speakers can verify

2. **Collaboration**
   - As a Translator, I can comment on translations so that we can discuss choices
   - As a Translator, I can see translation history so that I understand previous decisions
   - As a Translator, I can export my translations so that I can work offline

## Activity Matrix

| Activity | Superadmin | RG Admin | Editor | Author | Translator |
|----------|------------|----------|---------|---------|------------|
| **System Level** |
| Create Review Group | ✓ | - | - | - | - |
| Manage System Settings | ✓ | - | - | - | - |
| View All RG Analytics | ✓ | - | - | - | - |
| **Review Group Level** |
| Create Namespace | ✓ | ✓ | - | - | - |
| Delete Namespace | ✓ | ✓ | - | - | - |
| Create Project | ✓ | ✓ | - | - | - |
| Manage Teams | ✓ | ✓ | - | - | - |
| Invite Users | ✓ | ✓ | - | - | - |
| **Namespace Level** |
| Create Element Set | ✓ | ✓ | ✓ | - | - |
| Edit Element Set | ✓ | ✓ | ✓ | - | - |
| Delete Element Set | ✓ | ✓ | ✓ | - | - |
| Create Value Vocabulary | ✓ | ✓ | ✓ | - | - |
| Edit Value Vocabulary | ✓ | ✓ | ✓ | - | - |
| Delete Value Vocabulary | ✓ | ✓ | ✓ | - | - |
| Manage Releases | ✓ | ✓ | ✓ | - | - |
| Import/Export Spreadsheets | ✓ | ✓ | ✓ | - | - |
| **Content Level** |
| Edit Spreadsheet Data | ✓ | ✓ | ✓ | ✓ | - |
| Create Documentation | ✓ | ✓ | ✓ | ✓ | - |
| Edit Documentation | ✓ | ✓ | ✓ | ✓ | - |
| **Translation Level** |
| Edit Translations | ✓ | ✓ | ✓ | - | ✓ |
| Approve Translations | ✓ | ✓ | ✓ | - | - |
| Assign Translators | ✓ | ✓ | - | - | - |

## API Endpoints Structure

### Authentication & Authorization
- `GET /api/auth/me` - Get current user with roles
- `GET /api/auth/permissions` - Get current user's permissions
- `POST /api/auth/check` - Check specific permission

### Review Group Management
- `GET /api/review-groups` - List review groups (filtered by permissions)
- `POST /api/review-groups` - Create review group (Superadmin only)
- `GET /api/review-groups/:id` - Get review group details
- `PUT /api/review-groups/:id` - Update review group
- `DELETE /api/review-groups/:id` - Delete review group (Superadmin only)

### Namespace Management
- `GET /api/review-groups/:rgId/namespaces` - List namespaces in RG
- `POST /api/review-groups/:rgId/namespaces` - Create namespace
- `GET /api/namespaces/:id` - Get namespace details
- `PUT /api/namespaces/:id` - Update namespace
- `DELETE /api/namespaces/:id` - Delete namespace

### Project Management
- `GET /api/review-groups/:rgId/projects` - List projects in RG
- `POST /api/review-groups/:rgId/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/teams` - Assign team to project
- `POST /api/projects/:id/namespaces` - Assign namespace to project

### Team Management
- `GET /api/review-groups/:rgId/teams` - List teams in RG
- `POST /api/review-groups/:rgId/teams` - Create team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `GET /api/teams/:id/members` - List team members
- `POST /api/teams/:id/members` - Add team member
- `PUT /api/teams/:id/members/:userId` - Update member role
- `DELETE /api/teams/:id/members/:userId` - Remove team member

### Content Management
- `GET /api/namespaces/:nsId/element-sets` - List element sets
- `POST /api/namespaces/:nsId/element-sets` - Create element set
- `GET /api/element-sets/:id` - Get element set details
- `PUT /api/element-sets/:id` - Update element set
- `DELETE /api/element-sets/:id` - Delete element set

### Vocabulary Management
- `GET /api/namespaces/:nsId/vocabularies` - List value vocabularies
- `POST /api/namespaces/:nsId/vocabularies` - Create vocabulary
- `GET /api/vocabularies/:id` - Get vocabulary details
- `PUT /api/vocabularies/:id` - Update vocabulary
- `DELETE /api/vocabularies/:id` - Delete vocabulary

### Translation Management
- `GET /api/namespaces/:nsId/translations` - List translations
- `GET /api/translations/:id` - Get translation details
- `PUT /api/translations/:id` - Update translation
- `POST /api/translations/:id/review` - Submit for review

### Release Management
- `GET /api/namespaces/:nsId/releases` - List releases
- `POST /api/namespaces/:nsId/releases` - Create release
- `GET /api/releases/:id` - Get release details
- `PUT /api/releases/:id` - Update release
- `POST /api/releases/:id/publish` - Publish release

## Permission Checks

### Resource-based Permissions

```typescript
// Example permission structure
interface Permission {
  resource: string;
  action: string;
  conditions?: {
    reviewGroup?: string;
    namespace?: string;
    team?: string;
    project?: string;
  };
}

// Example checks
canCreateNamespace(user, reviewGroup) => 
  user.role === 'superadmin' || 
  user.reviewGroupAdmin.includes(reviewGroup.id)

canEditElementSet(user, elementSet) =>
  user.role === 'superadmin' ||
  user.reviewGroupAdmin.includes(elementSet.reviewGroup) ||
  user.teams.some(t => t.role === 'editor' && t.namespaces.includes(elementSet.namespace))

canTranslate(user, translation) =>
  user.role === 'superadmin' ||
  user.reviewGroupAdmin.includes(translation.reviewGroup) ||
  user.teams.some(t => 
    t.role === 'editor' && t.namespaces.includes(translation.namespace)
  ) ||
  user.translations.some(t => 
    t.language === translation.language && 
    t.namespaces.includes(translation.namespace)
  )
```

## Implementation Phases

### Phase 1: Core Authorization
1. Implement Cerbos policies for all roles
2. Create user/role management APIs
3. Build permission checking middleware

### Phase 2: Entity Management
1. Implement Review Group CRUD operations
2. Implement Namespace management
3. Implement Team management

### Phase 3: Content Management
1. Implement Element Set management
2. Implement Vocabulary management
3. Implement Documentation pages

### Phase 4: Advanced Features
1. Implement Translation workflow
2. Implement Release management
3. Implement Import/Export functionality

### Phase 5: Integration
1. GitHub integration for issues/discussions
2. RDF export functionality
3. DCTAP management