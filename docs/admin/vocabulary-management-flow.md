# Vocabulary Management Flow

## Complete Round-Trip Workflow

```mermaid
graph TD
    Start([Editor Starts Work]) --> Decision{New or Update?}
    
    %% Initial Migration Path
    Decision -->|Initial Migration| RDF[Existing RDF]
    RDF --> GenSheet[Generate Spreadsheet]
    GenSheet --> ImportMDX[Import to MDX]
    ImportMDX --> MDXSource[(MDX as Source of Truth)]
    
    %% Update Path
    Decision -->|Update Existing| MDXSource
    MDXSource --> Export[Export to Sheets]
    
    %% Export Flow
    Export --> SelectContent{Select Content}
    SelectContent --> ElementSets[Element Sets]
    SelectContent --> ValueVocabs[Value Vocabularies]
    
    ElementSets --> ConfigExport[Configure Export]
    ValueVocabs --> ConfigExport
    
    ConfigExport --> LanguageSelect[Select Languages]
    LanguageSelect --> NewLang{New Language?}
    NewLang -->|Yes| AITranslate[Optional AI Pre-translate]
    NewLang -->|No| CreateSheet
    AITranslate --> CreateSheet[Create Sheet in Drive]
    
    CreateSheet --> Permissions[Set Permissions]
    Permissions --> ActiveSheet[(Active Sheet)]
    ActiveSheet --> Notify[Notify Team]
    
    %% Collaboration Phase
    Notify --> Collaborate[Collaborative Editing]
    Collaborate --> ReadyImport{Ready to Import?}
    ReadyImport -->|No| Collaborate
    ReadyImport -->|Yes| StartImport
    
    %% Import Flow
    StartImport[Start Import] --> SelectSheet[Select Active Sheet]
    SelectSheet --> CreateJob[Create Import Job]
    CreateJob --> Download[Download Sheet + DCTAP]
    
    Download --> CompareDCTAP{DCTAP Changed?}
    CompareDCTAP -->|No| ValidateData
    CompareDCTAP -->|Yes| DCTAPChoice{Update Default?}
    
    DCTAPChoice -->|Update Default| VersionDCTAP[Version & Update]
    DCTAPChoice -->|Create Variant| NewDCTAP[Create Variant]
    VersionDCTAP --> ValidateData
    NewDCTAP --> ValidateData
    
    %% Validation
    ValidateData[Validate Against DCTAP] --> CheckRules[IFLA Rules Check]
    CheckRules --> ConflictCheck{Conflicts?}
    
    ConflictCheck -->|Crowdin| ResolveMode[Choose Resolution Mode]
    ConflictCheck -->|Git| ShowConflicts[Show Conflicts]
    ConflictCheck -->|None| Preview
    
    ResolveMode --> Preview
    ShowConflicts --> Preview
    
    %% Commit Flow
    Preview[Generate Preview] --> CommitChoice{Commit Strategy}
    CommitChoice -->|Dry Run| ShowDiff[Show Diff Only]
    CommitChoice -->|Branch| CreateBranch[Create Import Branch]
    CommitChoice -->|Direct| CreateCommit[Create Commit]
    
    ShowDiff --> ReviewChoice{Proceed?}
    CreateBranch --> ReviewChoice
    CreateCommit --> ReviewChoice
    
    ReviewChoice -->|Approve| ExecuteCommit[Execute Commit]
    ReviewChoice -->|Reject| CancelImport[Cancel Import]
    
    ExecuteCommit --> Manifest[Create Import Manifest]
    Manifest --> MDXSource
    
    %% Revert Path
    ExecuteCommit --> RevertWindow{Within 24hr?}
    RevertWindow -->|Yes| RevertOption[Can Revert]
    RevertWindow -->|No| Permanent[Changes Permanent]
```

## Export Configuration Details

```mermaid
graph LR
    subgraph "Export Options"
        A[Select Namespace] --> B{Content Type}
        B -->|Elements| C[Element Sets]
        B -->|Values| D[Value Vocabularies]
        
        C --> E[Language Selection]
        D --> E
        
        E --> F[DCTAP Config]
        F --> G{Modify DCTAP?}
        G -->|Add Elements| H[Add to DCTAP]
        G -->|Reorder| I[Reorder Columns]
        G -->|No Change| J[Use Default]
    end
```

## Import Validation Pipeline

```mermaid
graph TB
    subgraph "Validation Steps"
        A[Download Data] --> B[Parse DCTAP]
        B --> C[Validate Structure]
        C --> D[Check Required Columns]
        D --> E[Validate Identifiers]
        E --> F[Check Languages]
        F --> G[Detect Duplicates]
        G --> H[Run Custom Rules]
        H --> I{All Valid?}
        I -->|Yes| J[Generate Preview]
        I -->|No| K[Show Errors]
        K --> L[Suggest Fixes]
    end
```

## Translation Mode Decision Tree

```mermaid
graph TD
    A[Content to Translate] --> B{Content Type?}
    B -->|Pure Vocabulary| C[Spreadsheet Mode]
    B -->|Documentation Heavy| D[Crowdin Mode]
    B -->|Mixed Content| E[Analyze Ratio]
    
    E --> F{Vocabulary > 70%?}
    F -->|Yes| G[Suggest Spreadsheet]
    F -->|No| H{Instructions > 50%?}
    H -->|Yes| I[Suggest Crowdin]
    H -->|No| J[Suggest Hybrid]
    
    C --> K[Export to Sheet]
    D --> L[Send to Crowdin]
    J --> M[Split Content]
    M --> K
    M --> L
```

## Conflict Resolution Flow

```mermaid
graph LR
    A[Detect Conflict] --> B{Conflict Type}
    B -->|File Changed| C[Show Diff]
    B -->|Crowdin Active| D[Check Translation Status]
    B -->|Import Pending| E[Show Queue]
    
    C --> F{Resolution}
    D --> F
    E --> F
    
    F -->|Merge| G[Merge Algorithm]
    F -->|Override| H[Backup & Replace]
    F -->|Cancel| I[Abort Import]
    F -->|Queue| J[Schedule Later]
```

## System Architecture

```mermaid
graph TB
    subgraph "Frontend"
        UI[Import/Export UI]
        Status[Status Monitor]
        Preview[Preview Component]
    end
    
    subgraph "Backend Services"
        API[Next.js API Routes]
        Import[Import Service]
        Export[Export Service]
        Validate[Validation Engine]
    end
    
    subgraph "External Services"
        Clerk[Clerk Auth]
        Google[Google APIs]
        GitHub[GitHub API]
        Supabase[(Supabase DB)]
        Crowdin[Crowdin API]
    end
    
    subgraph "Storage"
        MDX[(MDX Files)]
        Manifests[(Import Manifests)]
        DCTAP[(DCTAP Versions)]
        Sheets[(Active Sheets)]
    end
    
    UI --> API
    Status --> API
    Preview --> API
    
    API --> Import
    API --> Export
    API --> Validate
    
    Import --> Google
    Import --> GitHub
    Import --> Supabase
    Import --> MDX
    
    Export --> Google
    Export --> Supabase
    Export --> DCTAP
    
    Validate --> DCTAP
    Validate --> Crowdin
    
    Clerk --> API
    
    Supabase --> Manifests
    Supabase --> Sheets
```

## Key Design Decisions

1. **Source of Truth**: MDX files in Git after initial migration
2. **Collaboration Tool**: Google Sheets for multi-user editing
3. **Version Control**: Git for all changes, Supabase for metadata
4. **Conflict Resolution**: Multiple strategies based on context
5. **Rollback Window**: 24 hours for easy reversion
6. **Translation Flexibility**: Three modes to handle different content types
7. **DCTAP Versioning**: Preserves RDF integrity while allowing evolution