# UI Components for Multi-Element Set Architecture

## Core Navigation Components

### 1. Namespace Hub Component

A landing page component that provides an overview of all element sets and vocabularies in a namespace.

```tsx
// src/components/NamespaceHub/NamespaceHub.tsx
import React from 'react';
import { ElementSetCard } from '../ElementSetCard';
import { VocabularyCard } from '../VocabularyCard';
import { NamespaceStats } from '../NamespaceStats';
import styles from './NamespaceHub.module.css';

interface NamespaceHubProps {
  namespace: {
    id: string;
    title: string;
    description: string;
    elementSets: ElementSetInfo[];
    vocabularies: VocabularyInfo[];
  };
}

export function NamespaceHub({ namespace }: NamespaceHubProps) {
  return (
    <div className={styles.hub}>
      <header className={styles.header}>
        <h1>{namespace.title}</h1>
        <p className={styles.description}>{namespace.description}</p>
        <NamespaceStats namespace={namespace} />
      </header>

      <section className={styles.section}>
        <h2>Element Sets</h2>
        <div className={styles.grid}>
          {namespace.elementSets.map(set => (
            <ElementSetCard key={set.id} elementSet={set} />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Vocabularies</h2>
        <div className={styles.grid}>
          {namespace.vocabularies.map(vocab => (
            <VocabularyCard key={vocab.id} vocabulary={vocab} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

### 2. Element Set Switcher

A component for switching between element sets within a namespace.

```tsx
// src/components/ElementSetSwitcher/ElementSetSwitcher.tsx
import React from 'react';
import { useLocation, useHistory } from '@docusaurus/router';
import { Select } from '@mui/material';
import styles from './ElementSetSwitcher.module.css';

export function ElementSetSwitcher({ currentSet, elementSets }) {
  const location = useLocation();
  const history = useHistory();

  const handleChange = (setId: string) => {
    // Preserve the relative path within the element set
    const pathParts = location.pathname.split('/');
    const elementSetIndex = pathParts.findIndex(part => part === currentSet.id);
    if (elementSetIndex > -1) {
      pathParts[elementSetIndex] = setId;
      history.push(pathParts.join('/'));
    }
  };

  return (
    <div className={styles.switcher}>
      <label>Element Set:</label>
      <Select
        value={currentSet.id}
        onChange={(e) => handleChange(e.target.value)}
        size="small"
      >
        {elementSets.map(set => (
          <option key={set.id} value={set.id}>
            {set.title} ({set.elementCount} elements)
          </option>
        ))}
      </Select>
    </div>
  );
}
```

### 3. Cross-Set Element Browser

A unified browser for exploring elements across multiple sets.

```tsx
// src/components/CrossSetBrowser/CrossSetBrowser.tsx
import React, { useState, useMemo } from 'react';
import { 
  DataGrid, 
  GridColDef, 
  GridToolbar 
} from '@mui/x-data-grid';
import { Chip, FormControl, Select, MenuItem } from '@mui/material';
import styles from './CrossSetBrowser.module.css';

interface Element {
  id: string;
  label: string;
  definition: string;
  elementSet: string;
  category: string;
  domain?: string;
  range?: string;
}

export function CrossSetBrowser({ elements, elementSets }) {
  const [selectedSets, setSelectedSets] = useState<string[]>(['all']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);

  const filteredElements = useMemo(() => {
    return elements.filter(element => {
      const setMatch = selectedSets.includes('all') || 
                      selectedSets.includes(element.elementSet);
      const categoryMatch = selectedCategories.includes('all') || 
                           selectedCategories.includes(element.category);
      return setMatch && categoryMatch;
    });
  }, [elements, selectedSets, selectedCategories]);

  const columns: GridColDef[] = [
    { 
      field: 'label', 
      headerName: 'Element', 
      width: 200,
      renderCell: (params) => (
        <a href={`/docs/elements/${params.row.elementSet}/${params.row.id}`}>
          {params.value}
        </a>
      )
    },
    { 
      field: 'elementSet', 
      headerName: 'Element Set', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={elementSets.find(s => s.id === params.value)?.title} 
          size="small"
          color="primary"
          variant="outlined"
        />
      )
    },
    { field: 'category', headerName: 'Category', width: 120 },
    { field: 'definition', headerName: 'Definition', flex: 1 },
    { field: 'domain', headerName: 'Domain', width: 100 },
    { field: 'range', headerName: 'Range', width: 100 },
  ];

  return (
    <div className={styles.browser}>
      <div className={styles.filters}>
        <FormControl size="small">
          <Select
            multiple
            value={selectedSets}
            onChange={(e) => setSelectedSets(e.target.value as string[])}
            renderValue={(selected) => 
              selected.includes('all') ? 'All Element Sets' : `${selected.length} selected`
            }
          >
            <MenuItem value="all">All Element Sets</MenuItem>
            {elementSets.map(set => (
              <MenuItem key={set.id} value={set.id}>{set.title}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small">
          <Select
            multiple
            value={selectedCategories}
            onChange={(e) => setSelectedCategories(e.target.value as string[])}
            renderValue={(selected) => 
              selected.includes('all') ? 'All Categories' : `${selected.length} selected`
            }
          >
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="statements">Statements</MenuItem>
            <MenuItem value="notes">Notes</MenuItem>
            <MenuItem value="attributes">Attributes</MenuItem>
            <MenuItem value="relationships">Relationships</MenuItem>
          </Select>
        </FormControl>
      </div>

      <DataGrid
        rows={filteredElements}
        columns={columns}
        pageSize={25}
        rowsPerPageOptions={[25, 50, 100]}
        checkboxSelection
        disableSelectionOnClick
        components={{ Toolbar: GridToolbar }}
        className={styles.grid}
      />
    </div>
  );
}
```

### 4. Element Set Comparison Tool

Compare elements across different element sets.

```tsx
// src/components/ElementComparison/ElementComparison.tsx
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Paper,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import styles from './ElementComparison.module.css';

export function ElementComparison({ elementSets }) {
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'differences'>('side-by-side');
  const [selectedSets, setSelectedSets] = useState<string[]>([]);

  return (
    <Paper className={styles.comparison}>
      <Tabs value={comparisonMode} onChange={(_, v) => setComparisonMode(v)}>
        <Tab value="side-by-side" label="Side by Side" />
        <Tab value="differences" label="Show Differences Only" />
      </Tabs>

      {comparisonMode === 'side-by-side' && (
        <SideBySideComparison 
          elementSets={elementSets} 
          selectedSets={selectedSets}
        />
      )}

      {comparisonMode === 'differences' && (
        <DifferenceView 
          elementSets={elementSets} 
          selectedSets={selectedSets}
        />
      )}
    </Paper>
  );
}
```

### 5. Visual Element Set Map

Interactive visualization of element relationships.

```tsx
// src/components/ElementSetMap/ElementSetMap.tsx
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import styles from './ElementSetMap.module.css';

export function ElementSetMap({ elementSets, relationships }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;

    // Create force simulation
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Render nodes and links
    // ... D3 visualization code
  }, [elementSets, relationships]);

  return (
    <div className={styles.map}>
      <svg ref={svgRef} width="100%" height="600px" />
      <div className={styles.legend}>
        <h4>Legend</h4>
        <div className={styles.legendItem}>
          <span className={styles.elementSetNode} />
          Element Set
        </div>
        <div className={styles.legendItem}>
          <span className={styles.vocabularyNode} />
          Vocabulary
        </div>
      </div>
    </div>
  );
}
```

## Enhanced Sidebar Components

### 1. Multi-Level Sidebar with Context

```tsx
// src/theme/DocSidebar/Desktop/Content/index.tsx
import React from 'react';
import { useLocation } from '@docusaurus/router';
import { ElementSetSwitcher } from '@site/src/components/ElementSetSwitcher';
import Content from '@theme-original/DocSidebar/Desktop/Content';
import styles from './styles.module.css';

export default function ContentWrapper(props) {
  const location = useLocation();
  const isInElementSet = location.pathname.includes('/elements/');
  
  return (
    <>
      {isInElementSet && (
        <div className={styles.sidebarHeader}>
          <ElementSetSwitcher />
        </div>
      )}
      <Content {...props} />
    </>
  );
}
```

### 2. Breadcrumb Enhancement

```tsx
// src/theme/DocBreadcrumbs/index.tsx
import React from 'react';
import { useLocation } from '@docusaurus/router';
import BreadcrumbsOriginal from '@theme-original/DocBreadcrumbs';
import { Chip } from '@mui/material';
import styles from './styles.module.css';

export default function DocBreadcrumbs(props) {
  const location = useLocation();
  const elementSetMatch = location.pathname.match(/\/elements\/([^\/]+)/);
  
  return (
    <div className={styles.breadcrumbsWrapper}>
      <BreadcrumbsOriginal {...props} />
      {elementSetMatch && (
        <Chip 
          label={`Element Set: ${elementSetMatch[1]}`}
          size="small"
          className={styles.contextChip}
        />
      )}
    </div>
  );
}
```

## Search Enhancement

### Global Search with Filtering

```tsx
// src/theme/SearchBar/index.tsx
import React from 'react';
import SearchBarOriginal from '@theme-original/SearchBar';
import { SearchFilters } from '@site/src/components/SearchFilters';
import styles from './styles.module.css';

export default function SearchBar(props) {
  return (
    <div className={styles.searchWrapper}>
      <SearchBarOriginal {...props} />
      <SearchFilters />
    </div>
  );
}
```

## Mobile-Responsive Navigation

### Mobile Element Set Menu

```tsx
// src/components/MobileElementSetMenu/MobileElementSetMenu.tsx
import React, { useState } from 'react';
import { IconButton, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import styles from './MobileElementSetMenu.module.css';

export function MobileElementSetMenu({ elementSets, currentSet }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="element sets menu"
        onClick={() => setOpen(true)}
        className={styles.menuButton}
      >
        <MenuIcon />
      </IconButton>
      
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className={styles.drawer}>
          <h3>Element Sets</h3>
          <List>
            {elementSets.map(set => (
              <ListItem
                button
                key={set.id}
                selected={set.id === currentSet?.id}
                component="a"
                href={`/docs/elements/${set.id}`}
              >
                <ListItemText 
                  primary={set.title}
                  secondary={`${set.elementCount} elements`}
                />
              </ListItem>
            ))}
          </List>
        </div>
      </Drawer>
    </>
  );
}
```

## Implementation Priority

1. **Phase 1**: NamespaceHub and ElementSetCard components
2. **Phase 2**: CrossSetBrowser and search enhancements
3. **Phase 3**: ElementSetSwitcher and navigation improvements
4. **Phase 4**: Comparison tools and visualization
5. **Phase 5**: Mobile optimization

These components provide a comprehensive UI solution for navigating and understanding multiple element sets within a single namespace.