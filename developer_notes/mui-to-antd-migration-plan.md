# MUI to Ant Design Migration Roadmap

**Project**: IFLA Standards Development Admin Portal  
**Created**: 2025-08-20  
**Objective**: Complete migration from Material-UI to Ant Design for refine.dev compatibility  
**Current Status**: 28% Complete (8 of 29 major components migrated)

---

## Critical Rules & Guidelines

### ⚠️ MANDATORY RULES
1. **NEVER hardcode `/admin` basePath** - Use root-relative paths (`/dashboard` not `/admin/dashboard`)
2. **Always use `addBasePath()` utility** for API calls and static assets
3. **Use `siteConfig.ts`** as single source of truth for environment-aware URLs
4. **Follow established conversion maps** (see Section 10)
5. **Maintain type safety** - No `any` without documentation
6. **Test before committing** - Run `pnpm test` and `pnpm typecheck`

---

## Migration Phases

### Phase 0: Planning & Documentation ✅
- [x] Create this migration roadmap document
- [x] Document conversion patterns and maps
- [x] Set up Ant Design theme configuration
- [x] Configure RefineProvider with Ant Design

**Status**: ✅ PHASE COMPLETE

---

### Phase 1: High-Priority Dashboard Components
**Target**: 3 critical components for core functionality

- [ ] `/app/(authenticated)/import/ImportWorkflow.tsx` (664 lines)
  - Replace MUI imports with Ant Design
  - Update Stepper → Steps component
  - Migrate form components to Ant Design Form
  - Update validation with Zod integration
  
- [ ] `/app/(authenticated)/import/status/[jobId]/page.tsx`
  - Convert MUI progress indicators to Ant Design Progress
  - Update status displays with Ant Design components
  - Maintain real-time polling functionality
  
- [ ] `/app/(authenticated)/profiles/ProfilesManager.tsx`
  - Migrate data grid to Ant Design Table
  - Update modal dialogs to Ant Design Modal
  - Convert form handling to Ant Design Form

**Conversion Checklist**:
- [ ] All MUI imports replaced
- [ ] Icons migrated to Ant Design icons
- [ ] Refine hooks updated to `@refinedev/antd`
- [ ] Tests passing (`pnpm test`)
- [ ] TypeScript checks passing (`pnpm typecheck`)

**Status**: ⏳ PENDING - Awaiting approval to start

---

### Phase 2: Site Management Components
**Target**: 15 components in `/components/site-management/`

#### Sub-Phase 2.1: Core Site Components (5)
- [ ] `SiteOverviewPage.tsx`
- [ ] `SiteSettingsPage.tsx`
- [ ] `SiteContentManagementPage.tsx`
- [ ] `SiteElementsPage.tsx`
- [ ] `SiteQualityPage.tsx`

#### Sub-Phase 2.2: Workflow Components (5)
- [ ] `SiteWorkflowPage.tsx`
- [ ] `SiteReleasesPage.tsx`
- [ ] `SiteGithubPage.tsx`
- [ ] `SiteRdfManagementPage.tsx`
- [ ] `SiteTeamManagementPage.tsx`

#### Sub-Phase 2.3: Vocabulary Components (5)
- [ ] `SiteVocabulariesPage.tsx`
- [ ] `SiteVocabularyCreatePage.tsx`
- [ ] `SiteVocabularyEditPage.tsx`
- [ ] `SiteManagementDashboardLayout.tsx`
- [ ] `ActionGrid.tsx`

**Conversion Checklist**:
- [ ] Grid system converted (MUI Grid → Ant Design Row/Col)
- [ ] Responsive behavior with `Grid.useBreakpoint`
- [ ] All components render without errors
- [ ] Unit tests created/updated

**Status**: ⏳ PENDING - Awaiting Phase 1 completion

---

### Phase 3: Dashboard Sub-Pages
**Target**: 22 role-specific dashboard pages

#### Sub-Phase 3.1: Admin Pages (6)
- [ ] `AdminOverviewPage.tsx`
- [ ] `AdminUsersPage.tsx`
- [ ] `AdminNamespacesPage.tsx`
- [ ] `AdminProjectsPage.tsx`
- [ ] `AdminReviewGroupsPage.tsx`
- [ ] `AdminActivityPage.tsx`

#### Sub-Phase 3.2: Author Pages (4)
- [ ] `author/OverviewPage.tsx`
- [ ] `TasksPage.tsx`
- [ ] `ToolsPage.tsx`
- [ ] `AuthorDashboardLayout.tsx`

#### Sub-Phase 3.3: Editor Pages (5)
- [ ] `editor/OverviewPage.tsx`
- [ ] `EditorialPage.tsx`
- [ ] `ImportExportPage.tsx`
- [ ] `SystemPage.tsx`
- [ ] `EditorDashboardLayout.tsx`

#### Sub-Phase 3.4: Review Group Pages (5)
- [ ] `RGOverviewPage.tsx`
- [ ] `RGNamespacesPage.tsx`
- [ ] `RGProjectsPage.tsx`
- [ ] `RGTeamPage.tsx`
- [ ] `RGActivityPage.tsx`

#### Sub-Phase 3.5: Shared Pages (5)
- [ ] `shared/NamespacesPage.tsx`
- [ ] `shared/ProjectsPage.tsx`
- [ ] `shared/ActivityPage.tsx`
- [ ] `shared/ReviewPage.tsx`
- [ ] `shared/TranslationPage.tsx`

**Conversion Checklist**:
- [ ] Role-based conditionals working
- [ ] Navigation between pages functional
- [ ] Playwright E2E tests updated

**Status**: ⏳ PENDING - Awaiting Phase 2 completion

---

### Phase 4: Data Display Components
**Target**: 4 complex data visualization components

- [ ] `SpreadsheetViewer.tsx`
  - MUI DataGrid → Ant Design Table
  - Preserve virtual scrolling
  - Maintain cell formatting
  
- [ ] `ValidationReport.tsx`
  - Convert report displays to Ant Design
  - Update status indicators
  
- [ ] `VersionComparison.tsx`
  - Migrate diff viewer components
  - Update comparison UI
  
- [ ] `VersionManager.tsx`
  - Convert version control interface
  - Update version history display

**Conversion Checklist**:
- [ ] Large dataset performance maintained (>10,000 rows)
- [ ] Accessibility features preserved
- [ ] Export functionality working

**Status**: ⏳ PENDING - Awaiting Phase 3 completion

---

### Phase 5: Accessibility & Layout Components
**Target**: 8 infrastructure components

- [ ] `LiveRegion.tsx` - ARIA live region component
- [ ] `SkipLinks.tsx` - Keyboard navigation aids
- [ ] `WelcomePage.tsx` - Initial landing page
- [ ] `RequestInviteButton.tsx` - User invitation component
- [ ] `StandardDashboardLayout.tsx` - Standard page layout
- [ ] `TabBasedDashboardLayout.tsx` - Already migrated, needs testing
- [ ] Navigation helpers (`/lib/navigation/*.ts`)
- [ ] Theme context removal (`/contexts/theme-context.tsx`)

**Conversion Checklist**:
- [ ] WCAG 2.1 AA compliance maintained
- [ ] Keyboard navigation functional
- [ ] Screen reader compatibility verified

**Status**: ⏳ PENDING - Awaiting Phase 4 completion

---

### Phase 6: Utility & Theme Cleanup
**Target**: Remove all MUI dependencies and clean up

- [ ] Remove `@mui/*` dependencies from package.json
- [ ] Remove `@emotion/*` dependencies
- [ ] Delete `/theme/mui-theme.ts`
- [ ] Delete `/theme/theme-augmentation.d.ts`
- [ ] Delete all `.mui.bak` files
- [ ] Update import statements project-wide
- [ ] Run `pnpm fresh` to regenerate lockfile

**Status**: ⏳ PENDING - Awaiting Phase 5 completion

---

### Phase 7: Testing & CI Updates
**Target**: Comprehensive test suite updates

- [ ] Run `nx affected --target=test` and fix failures
- [ ] Update Playwright E2E tests for Ant Design
- [ ] Run `pnpm test:builds:affected`
- [ ] Add Husky pre-commit hook to block MUI imports
- [ ] Verify test performance (<60s selective, <180s pre-push)
- [ ] Update CI/CD pipeline configurations

**Status**: ⏳ PENDING - Awaiting Phase 6 completion

---

### Phase 8: Production Build & Verification
**Target**: Production-ready build validation

- [ ] Run `pnpm nx build admin` successfully
- [ ] Run `pnpm build:all` for all sites
- [ ] Lighthouse CI performance audit
- [ ] Manual accessibility testing (NVDA/JAWS)
- [ ] Mobile responsiveness testing
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Tag release candidate `migration-antd-v1`

**Status**: ⏳ PENDING - Awaiting Phase 7 completion

---

### Phase 9: Documentation & Knowledge Transfer
**Target**: Complete documentation and handoff

- [ ] Update `MUI_TO_ANTD_MIGRATION_REPORT.md` to 100% complete
- [ ] Create `/developer_notes/antd-usage-cheatsheet.md`
- [ ] Update WARP.md to remove MUI references
- [ ] Update CHANGELOG.md with migration notes
- [ ] Create migration guide for future developers
- [ ] Archive MUI-related documentation
- [ ] Close migration project issue

**Status**: ⏳ PENDING - Awaiting Phase 8 completion

---

## Section 10: Reference Maps

### Component Conversion Map

| Material-UI | Ant Design | Notes |
|------------|------------|-------|
| Box | div | Use inline styles or CSS |
| Grid | Row/Col | Grid container → Row, Grid item → Col |
| Typography | Typography.Text/Title | Variant mapping required |
| Card/CardContent | Card | Simplified structure |
| Button | Button | Update variant to type |
| Chip | Tag | Different prop names |
| IconButton | Button with icon | type="text" |
| TextField | Input | Form integration different |
| Alert | Alert | Similar but different props |
| List/ListItem | List/List.Item | Different structure |
| Drawer | Drawer | Update bodyStyle to styles.body |
| AppBar | Layout.Header | Complete restructure |
| Stack | Space | Different orientation props |
| LinearProgress | Progress | Different props |
| CircularProgress | Spin | Different usage |
| Stepper | Steps | Different API |
| Tab/Tabs | Tabs | Similar but different props |
| Dialog | Modal | Different prop names |
| Snackbar | notification/message | Global API |
| DataGrid | Table | Complete restructure |
| Autocomplete | AutoComplete | Different API |
| Select | Select | Similar with differences |
| Checkbox | Checkbox | Similar |
| Radio | Radio | Similar |
| Switch | Switch | Similar |
| Slider | Slider | Different props |
| Rating | Rate | Different name |
| Breadcrumbs | Breadcrumb | Different structure |
| Pagination | Pagination | Similar |
| Tooltip | Tooltip | Similar |
| Badge | Badge | Similar |
| Avatar | Avatar | Similar |
| Menu | Menu/Dropdown | Context dependent |
| FormControl | Form.Item | Different structure |

### Icon Migration Map

| MUI Icon | Ant Design Icon |
|----------|-----------------|
| Home | HomeOutlined |
| Person | UserOutlined |
| Settings | SettingOutlined |
| Edit | EditOutlined |
| Delete | DeleteOutlined |
| Add | PlusOutlined |
| GitHub | GithubOutlined |
| Language | GlobalOutlined |
| Folder | FolderOutlined |
| Assignment | ProjectOutlined |
| Dashboard | DashboardOutlined |
| Group | TeamOutlined |
| Check | CheckOutlined |
| Close | CloseOutlined |
| Search | SearchOutlined |
| Filter | FilterOutlined |
| Download | DownloadOutlined |
| Upload | UploadOutlined |
| Refresh | ReloadOutlined |
| ExpandMore | DownOutlined |
| ChevronRight | RightOutlined |
| ArrowBack | LeftOutlined |
| MoreVert | MoreOutlined |
| Info | InfoCircleOutlined |
| Warning | WarningOutlined |
| Error | CloseCircleOutlined |
| Help | QuestionCircleOutlined |
| Visibility | EyeOutlined |
| VisibilityOff | EyeInvisibleOutlined |
| Lock | LockOutlined |
| LockOpen | UnlockOutlined |
| Mail | MailOutlined |
| Phone | PhoneOutlined |
| Calendar | CalendarOutlined |
| Schedule | ClockCircleOutlined |
| AttachFile | PaperClipOutlined |
| CloudUpload | CloudUploadOutlined |
| CloudDownload | CloudDownloadOutlined |
| Print | PrinterOutlined |
| Share | ShareAltOutlined |
| Favorite | HeartOutlined |
| Star | StarOutlined |
| ThumbUp | LikeOutlined |
| ThumbDown | DislikeOutlined |
| Comment | CommentOutlined |
| Notifications | BellOutlined |
| Menu | MenuOutlined |
| Code | CodeOutlined |
| FormatListBulleted | UnorderedListOutlined |
| FormatListNumbered | OrderedListOutlined |
| InsertChart | BarChartOutlined |
| Timeline | LineChartOutlined |
| TrendingUp | RiseOutlined |
| TrendingDown | FallOutlined |
| AttachMoney | DollarOutlined |
| ShoppingCart | ShoppingCartOutlined |
| Store | ShopOutlined |
| LocalShipping | CarOutlined |
| Flight | RocketOutlined |
| Hotel | HomeOutlined |
| Restaurant | CoffeeOutlined |
| Wifi | WifiOutlined |
| Battery | ThunderboltOutlined |
| Bluetooth | ApiOutlined |
| Computer | DesktopOutlined |
| Smartphone | MobileOutlined |
| Tablet | TabletOutlined |
| Keyboard | FormOutlined |
| Mouse | AimOutlined |
| Storage | DatabaseOutlined |
| Cloud | CloudOutlined |
| Folder | FolderOutlined |
| CreateNewFolder | FolderAddOutlined |
| InsertDriveFile | FileOutlined |
| FileCopy | CopyOutlined |
| ContentCut | ScissorOutlined |
| ContentPaste | SnippetsOutlined |

### Color System Mapping

| MUI Palette | Ant Design Token | Hex Value |
|------------|------------------|-----------|
| primary.main | colorPrimary | #1890ff |
| secondary.main | colorInfo | #722ed1 |
| error.main | colorError | #ff4d4f |
| warning.main | colorWarning | #faad14 |
| info.main | colorInfo | #13c2c2 |
| success.main | colorSuccess | #52c41a |
| grey[50] | colorBgContainer | #fafafa |
| grey[100] | colorBorderSecondary | #f5f5f5 |
| grey[200] | colorFillQuaternary | #f0f0f0 |
| grey[300] | colorFillTertiary | #d9d9d9 |
| grey[400] | colorFillSecondary | #bfbfbf |
| grey[500] | colorFill | #8c8c8c |
| grey[600] | colorTextDescription | #595959 |
| grey[700] | colorTextSecondary | #434343 |
| grey[800] | colorTextLabel | #262626 |
| grey[900] | colorText | #1f1f1f |

### Prop Migration Patterns

```typescript
// MUI → Ant Design

// Spacing
sx={{ m: 2, p: 1 }} → style={{ margin: 16, padding: 8 }}

// Flexbox
<Stack direction="row" spacing={2}> → <Space direction="horizontal" size={16}>

// Grid
<Grid container spacing={2}> → <Row gutter={16}>
<Grid item xs={12} md={6}> → <Col xs={24} md={12}>

// Typography
<Typography variant="h1"> → <Typography.Title level={1}>
<Typography variant="body1"> → <Typography.Text>

// Form Controls
<TextField label="Name" /> → <Form.Item label="Name"><Input /></Form.Item>

// Buttons
<Button variant="contained"> → <Button type="primary">
<Button variant="outlined"> → <Button type="default">
<Button variant="text"> → <Button type="text">

// Modals
<Dialog open={open}> → <Modal open={open}>

// Lists
<List><ListItem>Item</ListItem></List> → <List dataSource={[]} renderItem={item => <List.Item>{item}</List.Item>} />

// Cards
<Card><CardContent>Content</CardContent></Card> → <Card>Content</Card>

// Progress
<LinearProgress value={50} /> → <Progress percent={50} />
<CircularProgress /> → <Spin />

// Alerts
<Alert severity="error"> → <Alert type="error">

// Drawers
<Drawer anchor="left" open={open}> → <Drawer placement="left" open={open}>

// Tabs
<Tabs value={value}><Tab label="Tab 1" /></Tabs> → <Tabs activeKey={key} items={[{ label: 'Tab 1', key: '1' }]} />
```

---

## Approval Checkpoints

Each phase requires approval before proceeding to the next:

1. **Phase 0**: ✅ Documentation complete
2. **Phase 1**: ⏳ Core dashboard components
3. **Phase 2**: ⏳ Site management suite
4. **Phase 3**: ⏳ All dashboard pages
5. **Phase 4**: ⏳ Data display components
6. **Phase 5**: ⏳ Accessibility & layouts
7. **Phase 6**: ⏳ Cleanup complete
8. **Phase 7**: ⏳ All tests passing
9. **Phase 8**: ⏳ Production ready
10. **Phase 9**: ⏳ Documentation complete

---

## Success Criteria

- [ ] All MUI imports removed from codebase
- [ ] All components render without errors
- [ ] All tests passing (unit, integration, E2E)
- [ ] TypeScript compilation successful
- [ ] Production build successful
- [ ] Performance metrics maintained or improved
- [ ] Accessibility standards maintained (WCAG 2.1 AA)
- [ ] Documentation updated
- [ ] Team trained on Ant Design patterns

---

**Last Updated**: 2025-08-20  
**Next Review**: After Phase 1 completion
