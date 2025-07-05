# **IFLA Standards-Dev → “Clean 2025” Refactor – MASTER TASK LIST (v1.1)**





*(Hand this doc to any coding-AI or human contributor as the single source of truth)*



------





## **📌 Goal**





> **In six weeks:** transform the existing standards-dev monorepo into a clean, domain-based workspace **without** losing Nx/TypeScript/Vitest optimisations or the 5-level test harness – while enabling a protected main branch and Vercel-backed preview branch.



------





## **🛡️ Ground Rules (apply to** 

## **every**

##  **task)**



| **#** | **Rule**                                                     | **Why**                                                      |
| ----- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1     | **Use nx move (or @nx/workspace:move) for any file/folder relocation.** | Auto-rewrites project.json, tsconfig.*, import paths, Jest/Vitest configs. |
| 2     | **Mark before you delete.** Tag unused code with /** @deprecated scheduled-removal YYYY-MM-DD */ and run the full test suite once. | Prevents accidental removal of transitive deps.              |
| 3     | **One TS & one TSUP config to rule them all.** Root-level tsconfig.base.json and tsup.config.ts are canonical; children only extends. | Consistent flags + faster incremental builds.                |
| 4     | **Scripts graduate to packages.** Every runnable script eventually lives in packages/<toolset>/src/ and is triggered by an Nx executor. | Cache-aware, typed, discoverable.                            |
| 5     | **Document drift checks in CI.** Any deviation (e.g., rogue tsup config) fails GitHub Actions. | Keeps future contributors honest.                            |



------





## **⏱️ Six-Week Sprint Map & Detailed Tasks**







### **WEEK 0 – Branch, Baseline** 

### **& Import Platform Skeleton**

###  **🆕**



| **Task ID** | **Task**                                             | **Who** | **AI Prompt / Manual Note**                                  |
| ----------- | ---------------------------------------------------- | ------- | ------------------------------------------------------------ |
| **0-1**     | Create snapshot branch                               | Human   | git switch -c restructure/phase-0 && git tag v0-monolith-stable |
| **0-2**     | Generate Nx dependency graph                         | AI      | “Generate dep graph and save to docs/depgraph-phase0.html.”  |
| **0-3**     | Run full 5-level test matrix, archive report         | AI      | “Run pnpm nx run-many --target=test --all --parallel=3 and commit reports/phase0/.” |
| **0-4**     | **Import platform api/ folder** via subtree          | AI      | Prompt ↓Add remote 'platform', fetch, then git read-tree --prefix=api -u platform/main:api && git commit -m 'feat: import platform api' |
| **0-5**     | **Import platform tools/, docs/, top-level READMEs** | AI      | Repeat 0-4 for each folder (tools, docs, README.md).         |
| **0-6**     | Convert imported folders to Nx projects              | AI      | “Run nx g @nx/node:lib api --directory=api --importPath=@ifla/api (adjust per folder).” |

> **Outcome:** skeleton directories from *platform* now exist inside the current repo **before** heavy refactor starts.



------





### **WEEK 1 – Dead-Code Cull & TS Normalisation**



| **Task ID** | **Task**                                                   | **Who** | **AI Prompt / Manual Note**                                  |
| ----------- | ---------------------------------------------------------- | ------- | ------------------------------------------------------------ |
| **1-1**     | Enumerate unused exports/files                             | AI      | “Run npx ts-unused-exports … & depcruise, output to _unused.txt, _depgraph.html.” |
| **1-2**     | Tag → test → delete zombies (e.g., packages/standards-cli) | Human   | Confirm zero incoming edges in _depgraph.html then delete.   |
| **1-3**     | Scaffold root tsconfig.base.json via Nx, harden flags      | AI      | nx g @nx/js:init --compiler=tsc then insert strict options.  |
| **1-4**     | Auto-insert "extends" in every child tsconfig              | AI      | Shell one-liner or JS codemod; commit.                       |
| **1-5**     | Create root tsup.config.ts; add targetDefault              | AI      | Stub packages re-export root config.                         |



------





### **WEEK 2 – Script → Tool Packages**



| **Task ID** | **Task**                                             | **Who** | **AI Prompt / Manual Note**                                  |
| ----------- | ---------------------------------------------------- | ------- | ------------------------------------------------------------ |
| **2-1**     | Create packages/build-tools, data-tools, qa-tools    | AI      | nx g @nx/js:lib build-tools --bundler=tsup --unitTestRunner=vitest (repeat). |
| **2-2**     | Move build scripts (scripts/build-*, nx-*)           | AI      | One nx move per file; rename to *.ts.                        |
| **2-3**     | Convert to executors                                 | AI      | “Add executor in build-tools/project.json wrapping \node dist/analyzeBundleSizes.js\\.” |
| **2-4**     | Replace old npm scripts with Nx targets              | Human   | Remove obsolete root package.json scripts.                   |
| **2-5**     | Update docs: developer_notes/command-line-scripts.md | AI      | Generate updated table of commands & targets.                |



------





### **WEEK 3 – Portal Decision & Refactor**



| **Task ID** | **Task**                                       | **Who** | **AI Prompt / Manual Note**                     |
| ----------- | ---------------------------------------------- | ------- | ----------------------------------------------- |
| **3-1**     | Rename Next.js apps/admin-portal → apps/portal | AI      | nx move apps/admin-portal apps/portal           |
| **3-2**     | Extract shared UI to packages/ui               | AI      | Move Navbar/Auth components; add barrel export. |
| **3-3**     | Add Docusaurus → Next.js redirects             | Human   | Configure Vercel rewrites; verify locally.      |
| **3-4**     | Update README & architecture docs              | AI      | Include updated diagram.                        |



------





### **WEEK 4 – SiteConfig & Preview Flow**



| **Task ID** | **Task**                                                | **Who** | **AI Prompt / Manual Note**                     |
| ----------- | ------------------------------------------------------- | ------- | ----------------------------------------------- |
| **4-1**     | Create typed packages/config/src/siteConfig.ts          | AI      | Model & sample entry per spec.                  |
| **4-2**     | Codemod docusaurus.config.ts files using SiteConfig     | AI      | Script rewrites url, baseUrl, deploymentBranch. |
| **4-3**     | GitHub branch rules: protect main, allow *-preview      | Human   | GH Settings UI.                                 |
| **4-4**     | Vercel: link repo, set production=main, preview=preview | Human   | Web UI; verify env vars.                        |
| **4-5**     | Add CI drift checks (verify-tsconfig, rogue tsup)       | AI      | YAML snippets provided.                         |



------





### **WEEK 5 – Test Harness Relink & Green CI**



| **Task ID** | **Task**                                              | **Who** | **AI Prompt / Manual Note**                   |
| ----------- | ----------------------------------------------------- | ------- | --------------------------------------------- |
| **5-1**     | Path update in E2E tests (/standards/ → /namespaces/) | AI      | Search-replace; run nx affected --target=e2e. |
| **5-2**     | Run full 5-level matrix on preview build              | AI      | Store results in reports/phase5/.             |
| **5-3**     | Fix test flakiness / path bugs                        | Human   | Focus on Group 3 cross-site tests.            |



------





### **WEEK 6 – Buffer, Perf, Docs & Release**



| **Task ID** | **Task**                                     | **Who** | **AI Prompt / Manual Note**                     |
| ----------- | -------------------------------------------- | ------- | ----------------------------------------------- |
| **6-1**     | Remove temporary alias paths (@ifla/theme/*) | AI      | Delete from tsconfig.base.json, run typecheck.  |
| **6-2**     | Measure build & typecheck timings pre/post   | AI      | time nx affected --target=typecheck comparison. |
| **6-3**     | Update contributor docs / dep-graphs         | AI      | Generate final ADR, dep-graph HTML.             |
| **6-4**     | Tag release, merge to main, celebrate        | Human   | git tag v1.0-clean-refactor && git push --tags  |



------





## **🤖 Copy-ready Prompts for Coding AI**



| **When**                        | **Prompt**                                                   |
| ------------------------------- | ------------------------------------------------------------ |
| **Import folder from platform** | Add remote 'platform' (git remote add platform ../platform), fetch, then git read-tree --prefix=$DST -u platform/main:$SRC && git commit -m 'feat: import platform $SRC'. |
| Move file or lib                | You are at repo root. Use nx move $SRC $DST and show me the actual shell command(s) only. |
| Create new tool lib             | Generate an Nx JS lib named $DST with tsup bundler, Vitest tests, import path @ifla/$DST. Do NOT write explanations. |
| Convert script → executor       | Add a run-commands target called $NAME to packages/$LIB/project.json that runs "$CMD". Show diff only. |
| Harden tsconfig base            | Open tsconfig.base.json and insert/replace the compilerOptions exactly as below… (then give JSON block). Output full file. |
| SiteConfig codemod              | Write a Node codemod that loads packages/config/src/siteConfig.ts and rewrites url, baseUrl, deploymentBranch in every **/docusaurus.config.ts. |
| Dep-graph snapshot              | Run nx dep-graph --file docs/depgraph-$TAG.html and commit.  |



------





## **🚦 When** 

## **NOT**

##  **to Use AI (manual checkpoints)**





1. **Dependency-free deletion:** visually inspect dep-graph for dynamic imports before final delete.
2. **Auth flows & secrets:** create .env files and Vercel secrets manually – never in AI logs.
3. **Branch protection & Vercel linking:** do these via the web UI so permissions are explicit.
4. **Large-scale codemods on MDX content:** preview diffs in IDE; watch for formatting loss.
5. **Final production release:** run smoke tests yourself before merging to main.





------





## **✅ Definition of Done**





- Root tsconfig.base.json & tsup.config.ts are the **only** canonical configs; all children extend.
- Dead code purged; no @deprecated scheduled-removal tags remain.
- All scripts live inside packages/*-tools and run via Nx targets.
- apps/portal (Next.js) serves authenticated portal; docs sites still build on Docusaurus.
- Protected main branch; Vercel preview builds on preview branch auto-pass 5-level test matrix.
- nx affected --target=typecheck < **60 s** on M2; preview build < **4 min** on Vercel.
- Documentation up-to-date (ADR, dep-graphs, contributor guide).





------



*Reference task IDs (**0-4**,* *3-2**, etc.) in AI chats to request focused assistance or status updates.*