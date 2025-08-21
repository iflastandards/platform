# Clerk Test Users Report

Generated: 2025-08-21T19:29:54.239Z

## Summary

- **Found**: 6 users
- **Missing**: 0 users

## User Details

### SUPERADMIN

- **Email**: superadmin+clerk_test@example.com
- **ID**: user_2zsI76wuc6kilY2CVPB0vOOLXWk
- **Name**: null null
- **Created**: 2025-07-14

**Public Metadata**:
```json
{
  "roles": [
    "superadmin"
  ],
  "systemRole": "admin"
}
```

**Private Metadata**:
```json
{}
```

**Expected Dashboard Route**:
- /dashboard/admin

---

### RGADMIN

- **Email**: rg_admin+clerk_test@example.com
- **ID**: user_2zsI22BmfFg4ZHGmGXJkDqDb8cO
- **Name**: null null
- **Created**: 2025-07-14

**Public Metadata**:
```json
{
  "role": "admin",
  "teams": [],
  "reviewGroups": [
    {
      "role": "admin",
      "reviewGroupId": "isbd"
    }
  ],
  "translations": []
}
```

**Private Metadata**:
```json
{}
```

**Expected Dashboard Route**:
- /dashboard/rg

---

### NSADMIN

- **Email**: ns_admin+clerk_test@example.com
- **ID**: user_313tItcDXXPSSyBLjCSRJq8ZqoZ
- **Name**: null null
- **Created**: 2025-08-09

**Public Metadata**:
```json
{
  "role": "admin",
  "teams": [
    {
      "role": "admin",
      "teamId": "isbd-namespace-admin",
      "namespaces": [
        "isbd",
        "isbdm"
      ],
      "reviewGroup": "isbd"
    }
  ],
  "reviewGroups": [],
  "translations": []
}
```

**Private Metadata**:
```json
{}
```

**Expected Dashboard Route**:
- /dashboard/isbd

---

### EDITOR

- **Email**: editor+clerk_test@example.com
- **ID**: user_2zsIAhLtHKrYZ3A4DSw3SsfjeId
- **Name**: null null
- **Created**: 2025-07-14

**Public Metadata**:
```json
{
  "role": "editor",
  "teams": [
    {
      "role": "editor",
      "teamId": "isbd-team-1",
      "namespaces": [
        "isbd",
        "isbdm"
      ],
      "reviewGroup": "isbd"
    }
  ],
  "reviewGroups": [],
  "translations": []
}
```

**Private Metadata**:
```json
{}
```

**Expected Dashboard Route**:
- /dashboard/editor

---

### AUTHOR

- **Email**: author+clerk_test@example.com
- **ID**: user_2zsIENGRT0Rw0ZZh9XR7DD1cxX3
- **Name**: null null
- **Created**: 2025-07-14

**Public Metadata**:
```json
{
  "role": "editor",
  "teams": [
    {
      "role": "author",
      "teamId": "lrm-team-1",
      "namespaces": [
        "lrm"
      ],
      "reviewGroup": "bcm"
    }
  ],
  "reviewGroups": [],
  "translations": []
}
```

**Private Metadata**:
```json
{}
```

**Expected Dashboard Route**:
- /dashboard/author

---

### TRANSLATOR

- **Email**: translator+clerk_test@example.com
- **ID**: user_2zsIHLeAdgRI9hexJd6MJMBKXD8
- **Name**: null null
- **Created**: 2025-07-14

**Public Metadata**:
```json
{
  "role": "translator",
  "teams": [],
  "reviewGroups": [],
  "translations": [
    {
      "language": "fr",
      "namespaces": [
        "isbd",
        "lrm"
      ]
    }
  ]
}
```

**Private Metadata**:
```json
{}
```

**Expected Dashboard Route**:
- /dashboard

---

