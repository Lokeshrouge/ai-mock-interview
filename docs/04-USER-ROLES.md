# User Roles and Permissions

## Role Hierarchy

```
ADMIN (Super User)
└── Full system access
    
STUDENT (End User)
└── Personal data and interview access only
```

## STUDENT Role

### Profile & Account Management
- ✅ Register new account
- ✅ Login/Logout
- ✅ Update personal profile
- ✅ Change password
- ✅ Upload profile picture
- ✅ View account details
- ❌ Delete own account (request admin)
- ❌ Access other students' data

### Resume Management
- ✅ Upload resume (PDF/DOCX)
- ✅ View uploaded resumes
- ✅ Download own resumes
- ✅ Delete own resumes
- ✅ Set active resume for interviews
- ✅ View extracted resume information
- ❌ Edit extracted data directly

### Interview Configuration
- ✅ Select target job role
- ✅ Choose interview type (HR/Technical/Project)
- ✅ Set difficulty level
- ✅ View available interview options
- ✅ Start new interview session
- ❌ Modify interview questions
- ❌ Skip AI evaluation

### Interview Execution
- ✅ View generated questions
- ✅ Submit text answers
- ✅ Navigate between questions
- ✅ Pause interview (save progress)
- ✅ Resume paused interviews
- ✅ Complete interview
- ❌ Regenerate questions mid-interview
- ❌ Edit submitted answers

### Results & Analytics
- ✅ View interview results
- ✅ See detailed feedback per question
- ✅ View performance scores
- ✅ Access improvement recommendations
- ✅ View interview history
- ✅ Track progress over time
- ✅ Export performance reports
- ❌ View other students' results
- ❌ Modify scores

### Restrictions
- Cannot access admin panel
- Cannot modify system configuration
- Cannot view aggregated statistics
- Cannot manage other users
- Cannot bypass authentication
- Cannot access raw AI prompts

---

## ADMIN Role

### User Management
- ✅ View all users
- ✅ Search/filter users
- ✅ View user details
- ✅ Deactivate/activate users
- ✅ Reset user passwords
- ✅ Delete users
- ✅ View user activity logs
- ✅ Export user data

### Job Role Management
- ✅ Create new job roles
- ✅ Edit job roles
- ✅ Delete job roles
- ✅ Define role-specific topics
- ✅ Set role difficulty mappings
- ✅ View role usage statistics

### Interview Management
- ✅ View all interviews
- ✅ Search interviews by user/date/role
- ✅ View interview details
- ✅ Monitor active interviews
- ✅ Access interview statistics
- ✅ Export interview data
- ❌ Modify completed interview scores

### System Configuration
- ✅ Configure AI service settings
- ✅ Manage API keys (secure)
- ✅ Set system parameters
- ✅ Configure file upload limits
- ✅ Manage question templates (if used)
- ✅ Set rate limits

### Analytics & Reporting
- ✅ View platform statistics
- ✅ Generate usage reports
- ✅ Monitor system health
- ✅ View error logs
- ✅ Track AI service usage
- ✅ Export analytics data

### Security & Audit
- ✅ View audit logs
- ✅ Monitor suspicious activity
- ✅ Review authentication logs
- ✅ Manage security policies

### Restrictions
- Cannot impersonate students
- Cannot view raw student passwords
- Cannot modify interview answers
- Should not access student resume content without reason
- Cannot bypass audit logging

---

## Permission Matrix

| Feature | Student | Admin |
|---------|---------|-------|
| **Authentication** |
| Register | ✅ | ❌ |
| Login | ✅ | ✅ |
| Change own password | ✅ | ✅ |
| Reset other's password | ❌ | ✅ |
| **Profile** |
| View own profile | ✅ | ✅ |
| Edit own profile | ✅ | ✅ |
| View others' profiles | ❌ | ✅ |
| Delete profile | ❌ | ✅ |
| **Resume** |
| Upload resume | ✅ | ❌ |
| View own resumes | ✅ | ❌ |
| View all resumes | ❌ | ✅ |
| **Interview** |
| Start interview | ✅ | ❌ |
| Answer questions | ✅ | ❌ |
| View own results | ✅ | ❌ |
| View all interviews | ❌ | ✅ |
| **System** |
| Manage job roles | ❌ | ✅ |
| Configure system | ❌ | ✅ |
| View analytics | ❌ | ✅ |

## Authentication Requirements

### Public Routes (No Auth)
- Landing page
- Login page
- Register page
- Password reset request

### Student Routes (Student Auth Required)
- Student dashboard
- Profile pages
- Resume upload/management
- Interview setup
- Interview room
- Results and history

### Admin Routes (Admin Auth Required)
- Admin dashboard
- User management
- Job role management
- System configuration
- Analytics

## Authorization Flow

```
Request → Verify JWT → Extract user role → Check route permissions → Allow/Deny
```

### Implementation
- JWT token contains: `userId`, `role`, `email`
- Backend validates role on every protected route
- Frontend hides unauthorized UI elements
- Backend enforces authorization (never trust frontend)
- Admin routes use separate guard/middleware
