# Dynamic System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     SRD Tracking System                      │
│                    (Fully Dynamic)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │         Settings Hub (/settings)         │
        │     Central Configuration Dashboard      │
        └─────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Departments  │    │    Stages    │    │  SRD Fields  │
│ /departments │    │   /stages    │    │  /srdfields  │
└──────────────┘    └──────────────┘    └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   MongoDB Atlas   │
                    │   (Database)      │
                    └──────────────────┘
```

## Component Architecture

### Frontend Layer

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Components                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  Settings Hub  │  │  Departments   │  │    Stages    │ │
│  │   (page.jsx)   │  │   (page.jsx)   │  │  (page.jsx)  │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  SRD Fields    │  │    Sidebar     │  │    Layout    │ │
│  │   (page.jsx)   │  │  (Sidebar.js)  │  │  (Layout.js) │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           shadcn/ui Components                        │  │
│  │  (Button, Card, Dialog, Input, Select, etc.)         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### API Layer

```
┌─────────────────────────────────────────────────────────────┐
│                        API Routes                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /api/departments                                            │
│  ├── GET     - List all departments                         │
│  ├── POST    - Create department                            │
│  └── /[id]                                                   │
│      ├── GET    - Get department details                    │
│      ├── PATCH  - Update department                         │
│      └── DELETE - Delete department                         │
│                                                              │
│  /api/stages                                                 │
│  ├── GET     - List all stages                              │
│  ├── POST    - Create stage                                 │
│  └── /[id]                                                   │
│      ├── GET    - Get stage details                         │
│      ├── PATCH  - Update stage                              │
│      └── DELETE - Soft delete stage                         │
│                                                              │
│  /api/newField                                               │
│  ├── GET     - List all fields                              │
│  ├── POST    - Create field                                 │
│  ├── PATCH   - Update field (with ?id=)                     │
│  └── DELETE  - Soft delete field (with ?id=)                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Layer

```
┌─────────────────────────────────────────────────────────────┐
│                      Mongoose Models                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Department Model                                            │
│  ├── name: String                                            │
│  ├── slug: String (unique)                                   │
│  ├── description: String                                     │
│  └── createdAt: Date                                         │
│                                                              │
│  Stage Model                                                 │
│  ├── name: String                                            │
│  ├── slug: String (unique)                                   │
│  ├── description: String                                     │
│  ├── color: String (hex)                                     │
│  ├── icon: String (Lucide name)                              │
│  ├── order: Number                                           │
│  ├── isActive: Boolean                                       │
│  ├── departments: [ObjectId]                                 │
│  ├── isAutomatic: Boolean                                    │
│  ├── rules: Map                                              │
│  ├── createdAt: Date                                         │
│  └── updatedAt: Date                                         │
│                                                              │
│  Field Model                                                 │
│  ├── name: String                                            │
│  ├── type: String                                            │
│  ├── placeholder: String                                     │
│  ├── department: String                                      │
│  ├── isRequired: Boolean                                     │
│  ├── slug: String                                            │
│  └── active: Boolean                                         │
│                                                              │
│  SRD Model (Enhanced)                                        │
│  ├── ... existing fields ...                                │
│  ├── dynamicFields: [{                                       │
│  │   field: ObjectId,                                        │
│  │   department: String,                                     │
│  │   name: String,                                           │
│  │   slug: String,                                           │
│  │   type: String,                                           │
│  │   value: Mixed,                                           │
│  │   isRequired: Boolean                                     │
│  │ }]                                                         │
│  └── status: Map<String, String>                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Creating a Department

```
User Action (UI)
      │
      ▼
┌─────────────────┐
│ Click "Add New" │
│   Department    │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Fill Form &    │
│     Submit      │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ POST /api/      │
│  departments    │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Validate Data  │
│  Generate Slug  │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Save to MongoDB │
│ (Department     │
│  Collection)    │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Return Success  │
│  & New Record   │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Update UI      │
│  Show in Table  │
└─────────────────┘
```

### Creating a Stage

```
User Action (UI)
      │
      ▼
┌─────────────────┐
│ Click "Add New" │
│     Stage       │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Fill Form:     │
│  - Name         │
│  - Color        │
│  - Icon         │
│  - Order        │
│  - Departments  │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ POST /api/      │
│    stages       │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Validate Data  │
│  Generate Slug  │
│  Check Depts    │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Save to MongoDB │
│    (Stage       │
│  Collection)    │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Populate Dept   │
│   References    │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Return Success  │
│  & New Record   │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  Update UI      │
│  Show in Table  │
└─────────────────┘
```

### Using Dynamic Fields in SRD

```
Create/Edit SRD
      │
      ▼
┌─────────────────┐
│ Fetch Active    │
│    Fields       │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Filter by Dept  │
│  (global + dept)│
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Render Form     │
│  with Dynamic   │
│    Fields       │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│  User Fills     │
│     Form        │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Validate Fields │
│  (required,     │
│   type, etc.)   │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Save to SRD     │
│ dynamicFields   │
│     Array       │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Display Values  │
│   in SRD View   │
└─────────────────┘
```

## State Management

### Component State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    React Component State                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  useState Hooks:                                             │
│  ├── modalOpen: Boolean                                      │
│  ├── values: Object (form data)                              │
│  ├── items: Array (departments/stages/fields)                │
│  ├── editingId: String | null                                │
│  └── loading: Boolean                                        │
│                                                              │
│  useEffect Hooks:                                            │
│  └── Fetch data on mount                                     │
│                                                              │
│  Event Handlers:                                             │
│  ├── openNew() - Reset form, open modal                      │
│  ├── openEdit(item) - Load item, open modal                  │
│  ├── handleSubmit(e) - Save data via API                     │
│  ├── handleDelete(item) - Delete via API                     │
│  └── fetchData() - Reload from API                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Security & Permissions

```
┌─────────────────────────────────────────────────────────────┐
│                    Access Control                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Role-Based Access:                                          │
│  ├── Admin                                                   │
│  │   ├── Full access to all config pages                    │
│  │   ├── Can create/edit/delete departments                 │
│  │   ├── Can create/edit/delete stages                      │
│  │   └── Can create/edit/delete fields                      │
│  │                                                           │
│  ├── Department Managers (VMD, CAD, etc.)                    │
│  │   ├── View-only access to config                         │
│  │   ├── Can use dynamic fields in SRDs                     │
│  │   └── Can update SRD status                              │
│  │                                                           │
│  └── Regular Users                                           │
│      ├── No access to config pages                          │
│      └── Can view/use SRDs                                   │
│                                                              │
│  Sidebar Navigation:                                         │
│  └── Config links only shown to admins                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema Relationships

```
┌─────────────────┐
│   Department    │
│  Collection     │
└────────┬────────┘
         │
         │ Referenced by
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│     Stage       │  │     Field       │
│  Collection     │  │  Collection     │
│                 │  │                 │
│ departments: [] │  │ department: str │
└────────┬────────┘  └────────┬────────┘
         │                    │
         │                    │
         │ Used by            │ Used by
         │                    │
         └────────┬───────────┘
                  │
                  ▼
         ┌─────────────────┐
         │      SRD        │
         │  Collection     │
         │                 │
         │ status: Map     │
         │ dynamicFields:[]│
         └─────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Production Stack                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (Next.js)                                          │
│  ├── Server-Side Rendering                                  │
│  ├── API Routes                                              │
│  └── Static Assets                                           │
│                                                              │
│  Database (MongoDB Atlas)                                    │
│  ├── Departments Collection                                 │
│  ├── Stages Collection                                       │
│  ├── Fields Collection                                       │
│  ├── SRD Collection                                          │
│  └── Users Collection                                        │
│                                                              │
│  Authentication (NextAuth.js)                                │
│  ├── Session Management                                      │
│  ├── Role-Based Access                                       │
│  └── Credentials Provider                                    │
│                                                              │
│  Real-Time (Pusher)                                          │
│  ├── Notifications                                           │
│  ├── Live Updates                                            │
│  └── WebSocket Connections                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                             │
└──────────────────────┬───────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  Next.js     │ │  Next.js     │ │  Next.js     │
│  Instance 1  │ │  Instance 2  │ │  Instance 3  │
└──────────────┘ └──────────────┘ └──────────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                       ▼
              ┌──────────────┐
              │   MongoDB    │
              │   Cluster    │
              └──────────────┘
```

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Caching Layers                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Client-Side:                                                │
│  ├── React State (in-memory)                                │
│  ├── SWR/React Query (optional)                              │
│  └── Browser Cache (static assets)                           │
│                                                              │
│  Server-Side:                                                │
│  ├── Next.js Cache                                           │
│  ├── API Response Cache                                      │
│  └── Database Query Cache                                    │
│                                                              │
│  CDN:                                                        │
│  ├── Static Assets                                           │
│  ├── Images                                                  │
│  └── CSS/JS Bundles                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Performance Optimization

### Database Indexing

```sql
-- Departments
db.departments.createIndex({ slug: 1 }, { unique: true })
db.departments.createIndex({ name: 1 })

-- Stages
db.stages.createIndex({ slug: 1 }, { unique: true })
db.stages.createIndex({ order: 1 })
db.stages.createIndex({ isActive: 1 })

-- Fields
db.fields.createIndex({ department: 1 })
db.fields.createIndex({ active: 1 })
db.fields.createIndex({ slug: 1 })

-- SRDs
db.srds.createIndex({ refNo: 1 }, { unique: true })
db.srds.createIndex({ "status": 1 })
db.srds.createIndex({ createdAt: -1 })
```

### Query Optimization

```javascript
// Efficient queries with population
Stage.find({ isActive: true })
  .populate('departments')
  .sort({ order: 1 })
  .lean() // Returns plain JS objects

// Projection to limit fields
Department.find({}, { name: 1, slug: 1 })

// Aggregation for complex queries
SRD.aggregate([
  { $match: { readyForProduction: true } },
  { $lookup: { from: 'departments', ... } },
  { $group: { _id: '$department', count: { $sum: 1 } } }
])
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────┐
│                    Error Handling Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend:                                                   │
│  ├── Try-Catch blocks in async functions                    │
│  ├── Error state in components                              │
│  ├── User-friendly error messages                           │
│  └── Toast notifications for errors                         │
│                                                              │
│  API Layer:                                                  │
│  ├── Validation errors (400)                                │
│  ├── Not found errors (404)                                 │
│  ├── Server errors (500)                                    │
│  └── Structured error responses                             │
│                                                              │
│  Database:                                                   │
│  ├── Mongoose validation errors                             │
│  ├── Duplicate key errors                                   │
│  ├── Connection errors                                      │
│  └── Transaction rollbacks                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Monitoring & Logging

```
┌─────────────────────────────────────────────────────────────┐
│                  Monitoring Strategy                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Application Logs:                                           │
│  ├── API request/response logs                              │
│  ├── Error logs with stack traces                           │
│  ├── Database query logs                                    │
│  └── User action logs                                        │
│                                                              │
│  Performance Metrics:                                        │
│  ├── API response times                                     │
│  ├── Database query performance                             │
│  ├── Page load times                                        │
│  └── Resource usage                                         │
│                                                              │
│  Business Metrics:                                           │
│  ├── Number of departments                                  │
│  ├── Number of stages                                       │
│  ├── Number of custom fields                                │
│  ├── SRD creation rate                                      │
│  └── Configuration changes                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Backup & Recovery

```
┌─────────────────────────────────────────────────────────────┐
│                  Backup Strategy                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Automated Backups:                                          │
│  ├── Daily full database backups                            │
│  ├── Hourly incremental backups                             │
│  ├── 30-day retention policy                                │
│  └── Off-site backup storage                                │
│                                                              │
│  Configuration Backups:                                      │
│  ├── Export departments as JSON                             │
│  ├── Export stages as JSON                                  │
│  ├── Export fields as JSON                                  │
│  └── Version control for configs                            │
│                                                              │
│  Recovery Procedures:                                        │
│  ├── Point-in-time recovery                                 │
│  ├── Selective collection restore                           │
│  ├── Configuration rollback                                 │
│  └── Disaster recovery plan                                 │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Summary

The dynamic system architecture provides:

- **Flexibility**: Easy configuration without code changes
- **Scalability**: Designed to handle growth
- **Maintainability**: Clean separation of concerns
- **Performance**: Optimized queries and caching
- **Reliability**: Error handling and backups
- **Security**: Role-based access control
- **Extensibility**: Easy to add new features

This architecture supports the core goal of making the SRD system fully customizable while maintaining performance, security, and ease of use.
