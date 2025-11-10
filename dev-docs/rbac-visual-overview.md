# RBAC Visual Overview

**Quick visual reference for understanding the RBAC system**

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "User Layer"
        U1[User: Sarah]
    end
    
    subgraph "Role Assignment Layer"
        R1[Role: Billing Admin]
        R2[Role: Team Lead Team A]
    end
    
    subgraph "Permission Layer"
        P1[org.billing.view]
        P2[org.billing.update]
        P3[teams.settings.update scope:own]
        P4[teams.members.add scope:own]
    end
    
    subgraph "Action Layer"
        A1[View Billing Dashboard]
        A2[Update Payment Method]
        A3[Update Team A Settings]
        A4[Add Members to Team A]
        A5[❌ Update Team B Settings]
    end
    
    U1 --> R1
    U1 --> R2
    
    R1 --> P1
    R1 --> P2
    R2 --> P3
    R2 --> P4
    
    P1 --> A1
    P2 --> A2
    P3 --> A3
    P4 --> A4
    P3 -.x A5
    
    style U1 fill:#e1f5ff
    style R1 fill:#fff4e6
    style R2 fill:#fff4e6
    style P1 fill:#e8f5e9
    style P2 fill:#e8f5e9
    style P3 fill:#e8f5e9
    style P4 fill:#e8f5e9
    style A1 fill:#f3e5f5
    style A2 fill:#f3e5f5
    style A3 fill:#f3e5f5
    style A4 fill:#f3e5f5
    style A5 fill:#ffebee
```

**Legend:**
- 🔵 Blue = User
- 🟡 Yellow = Roles (User can have multiple)
- 🟢 Green = Permissions (Roles grant permissions)
- 🟣 Purple = Allowed Actions
- 🔴 Red = Denied Actions

---

## 👥 Role Hierarchy

```mermaid
graph TD
    A[Admin<br/>Full Access] --> |Can Do Everything| Z[All Permissions]
    
    M[Manager<br/>Team Management] --> T1[Create Teams]
    M --> T2[Manage All Teams]
    M --> U1[Invite Users]
    
    TL[Team Lead<br/>Own Team Only] --> T3[Manage Their Team]
    TL --> T4[Add/Remove Members]
    
    BA[Billing Admin<br/>Billing Only] --> B1[View Billing]
    BA --> B2[Update Billing]
    
    ME[Member<br/>Basic Access] --> V1[View Teams They're In]
    ME --> V2[View Team Members]
    
    G[Guest<br/>Resource-Specific] --> R1[Access Shared Resources]
    
    style A fill:#ff6b6b,color:#fff
    style M fill:#4ecdc4
    style TL fill:#45b7d1
    style BA fill:#f9ca24
    style ME fill:#95afc0
    style G fill:#dfe6e9
```

---

## 🔄 Permission Check Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Frontend
    participant API as Convex API
    participant Auth as Permission Check
    participant DB as Database
    participant Audit as Audit Log
    
    User->>UI: Click "Delete Team"
    UI->>API: mutation(api.teams.delete, {teamId})
    
    API->>Auth: requirePermission(userId, "teams.delete", teamId)
    Auth->>DB: Get user roles
    DB-->>Auth: [billing_admin, team_lead]
    
    Auth->>DB: Get permissions for billing_admin
    DB-->>Auth: No teams.delete
    
    Auth->>DB: Get permissions for team_lead
    DB-->>Auth: teams.delete (scope: own)
    
    Auth->>DB: Is user team lead of this team?
    DB-->>Auth: No
    
    Auth->>Audit: Log access denied
    Auth-->>API: ❌ Permission Denied
    API-->>UI: Error
    UI-->>User: "You don't have permission"
```

---

## 🗄️ Database Schema Overview

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    USER_ROLES }o--|| ROLES : references
    ROLES ||--o{ ROLE_PERMISSIONS : has
    ROLE_PERMISSIONS }o--|| PERMISSIONS : references
    ORGANIZATIONS ||--o{ USER_ROLES : contains
    TEAMS ||--o{ USER_ROLES : contains
    USERS ||--o{ RESOURCE_GUESTS : can_be
    PERMISSION_AUDIT_LOG }o--|| USERS : tracks
    
    USERS {
        id userId PK
        string email
        string name
    }
    
    USER_ROLES {
        id userId FK
        string role FK
        id organizationId FK
        id teamId FK
        timestamp assignedAt
    }
    
    ROLES {
        string id PK
        string name
        string level
    }
    
    PERMISSIONS {
        string id PK
        string name
        string category
    }
    
    ROLE_PERMISSIONS {
        string roleId FK
        string permissionId FK
        string scope
    }
    
    RESOURCE_GUESTS {
        id guestUserId FK
        string resourceType
        string resourceId
        string permission
        timestamp expiresAt
    }
    
    PERMISSION_AUDIT_LOG {
        id userId FK
        string action
        string permissionId
        timestamp timestamp
    }
```

---

## 📊 Permission Scopes Explained

```mermaid
graph LR
    subgraph "Scope: ALL"
        A1[Admin] --> |Can manage| T1[Team A]
        A1 --> |Can manage| T2[Team B]
        A1 --> |Can manage| T3[Team C]
    end
    
    subgraph "Scope: OWN"
        TL1[Team Lead] --> |Can manage| T4[Their Team]
        TL1 -.x |Cannot manage| T5[Other Teams]
    end
    
    subgraph "Scope: ASSIGNED"
        M1[Member] --> |Can view| T6[Teams They're In]
        M1 -.x |Cannot view| T7[Other Teams]
    end
    
    style A1 fill:#ff6b6b,color:#fff
    style TL1 fill:#45b7d1
    style M1 fill:#95afc0
    style T1 fill:#e8f5e9
    style T2 fill:#e8f5e9
    style T3 fill:#e8f5e9
    style T4 fill:#e8f5e9
    style T5 fill:#ffebee
    style T6 fill:#e8f5e9
    style T7 fill:#ffebee
```

---

## 🎯 Real-World Examples

### Example 1: Sarah (Billing Admin + Team Lead)

```mermaid
graph TB
    S[👤 Sarah] --> |Has Role| BA[Billing Admin]
    S --> |Has Role| TL[Team Lead - Team A]
    
    BA --> |Grants| P1[org.billing.view]
    BA --> |Grants| P2[org.billing.update]
    
    TL --> |Grants| P3[teams.settings.update<br/>scope: own]
    TL --> |Grants| P4[teams.members.add<br/>scope: own]
    
    P1 --> A1[✅ View Billing Dashboard]
    P2 --> A2[✅ Update Payment Method]
    P3 --> A3[✅ Update Team A Settings]
    P3 -.-> A4[❌ Update Team B Settings]
    P4 --> A5[✅ Add Members to Team A]
    
    style S fill:#e1f5ff
    style BA fill:#f9ca24
    style TL fill:#45b7d1
    style A1 fill:#e8f5e9
    style A2 fill:#e8f5e9
    style A3 fill:#e8f5e9
    style A4 fill:#ffebee
    style A5 fill:#e8f5e9
```

**What Sarah Can Do:**
- ✅ View and update billing (from Billing Admin role)
- ✅ Manage Team A settings and members (from Team Lead role)
- ❌ Cannot manage Team B (not her team)
- ❌ Cannot delete organization (not Admin)

---

### Example 2: Guest Access (Phase 3)

```mermaid
sequenceDiagram
    actor Owner as Resource Owner
    actor Guest as Guest User
    participant System
    participant DB
    
    Owner->>System: Share Note with guest@email.com
    System->>DB: Create resourceGuest entry<br/>(noteId, edit permission)
    System->>Guest: Send email invite
    
    Guest->>System: Open invite link
    System->>DB: Verify guest access
    DB-->>System: ✅ Has edit permission
    System-->>Guest: Show note editor
    
    Guest->>System: Edit note
    System->>DB: Check permission
    DB-->>System: ✅ Allowed
    System->>DB: Save changes
    System-->>Guest: ✅ Saved
    
    Guest->>System: Try to view other notes
    System->>DB: Check permission
    DB-->>System: ❌ No access to other notes
    System-->>Guest: 404 Not Found
```

---

## 🚀 Implementation Phases

```mermaid
gantt
    title RBAC Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1: Foundation
    Database Schema           :2025-11-11, 1d
    Permission Functions      :2025-11-12, 2d
    Protect Convex Functions  :2025-11-14, 2d
    Frontend Composable       :2025-11-16, 1d
    Update UI Components      :2025-11-17, 2d
    Testing                   :2025-11-19, 2d
    
    section Phase 2: Billing
    Billing Permissions       :2025-11-21, 1d
    Protect Billing Functions :2025-11-22, 1d
    Update Billing UI         :2025-11-23, 1d
    
    section Phase 3: Guest Access
    Guest Infrastructure      :2025-11-25, 2d
    Invitation System         :2025-11-27, 2d
    Sharing UI                :2025-11-29, 2d
```

---

## 🧪 Testing Strategy Visual

```mermaid
graph TB
    subgraph "Unit Tests"
        U1[Permission Check Logic]
        U2[Role Assignment]
        U3[Multi-Role Resolution]
    end
    
    subgraph "Integration Tests"
        I1[Complete Permission Flow]
        I2[Database Operations]
        I3[Audit Logging]
    end
    
    subgraph "E2E Tests"
        E1[User Journeys]
        E2[UI Permission Gates]
        E3[Error Handling]
    end
    
    U1 --> I1
    U2 --> I1
    U3 --> I1
    
    I1 --> E1
    I2 --> E1
    I3 --> E1
    
    style U1 fill:#e3f2fd
    style U2 fill:#e3f2fd
    style U3 fill:#e3f2fd
    style I1 fill:#fff3e0
    style I2 fill:#fff3e0
    style I3 fill:#fff3e0
    style E1 fill:#e8f5e9
    style E2 fill:#e8f5e9
    style E3 fill:#e8f5e9
```

---

## 📈 Decision Tree: Which Role?

```mermaid
graph TD
    Start[New Team Member] --> Q1{Need Full Access?}
    Q1 --> |Yes| Admin[Assign: Admin]
    Q1 --> |No| Q2{Manage Teams?}
    
    Q2 --> |Create & Manage All| Manager[Assign: Manager]
    Q2 --> |Manage Specific Team| TeamLead[Assign: Team Lead]
    Q2 --> |No| Q3{Manage Billing?}
    
    Q3 --> |Yes| Q4{Also Manage Team?}
    Q4 --> |Yes| Multi1[Assign: Billing Admin<br/>+ Team Lead]
    Q4 --> |No| Billing[Assign: Billing Admin]
    
    Q3 --> |No| Q5{External User?}
    Q5 --> |Yes| Guest[Assign: Guest<br/>with resource access]
    Q5 --> |No| Member[Assign: Member]
    
    style Admin fill:#ff6b6b,color:#fff
    style Manager fill:#4ecdc4
    style TeamLead fill:#45b7d1
    style Billing fill:#f9ca24
    style Multi1 fill:#f9ca24
    style Member fill:#95afc0
    style Guest fill:#dfe6e9
```

---

## 🔍 Quick Lookup: "Can User Do X?"

```mermaid
graph TD
    Action[User Wants to Do Action] --> GetRoles[Get All User Roles]
    GetRoles --> CheckRole1{Check Role 1}
    
    CheckRole1 --> |Has Permission?| Scope1{Check Scope}
    CheckRole1 --> |No Permission| CheckRole2{Check Role 2}
    
    Scope1 --> |all| Allow[✅ ALLOW]
    Scope1 --> |own| Own{Owns Resource?}
    Scope1 --> |assigned| Assigned{Assigned to Resource?}
    
    Own --> |Yes| Allow
    Own --> |No| CheckRole2
    
    Assigned --> |Yes| Allow
    Assigned --> |No| CheckRole2
    
    CheckRole2 --> |Has Permission?| Scope2{Check Scope}
    CheckRole2 --> |No Permission| MoreRoles{More Roles?}
    
    Scope2 --> |all| Allow
    Scope2 --> |own/assigned| CheckResource[Check Resource]
    
    CheckResource --> |Match| Allow
    CheckResource --> |No Match| MoreRoles
    
    MoreRoles --> |Yes| CheckNext[Check Next Role]
    MoreRoles --> |No| Deny[❌ DENY]
    
    CheckNext --> CheckRole2
    
    Allow --> Log[Log Access Granted]
    Deny --> LogDeny[Log Access Denied]
    
    style Allow fill:#90EE90
    style Deny fill:#FFB6C1
```

---

**📖 Full Documentation**: [rbac-architecture.md](rbac-architecture.md)  
**⚡ Quick Reference**: [rbac-quick-reference.md](rbac-quick-reference.md)

