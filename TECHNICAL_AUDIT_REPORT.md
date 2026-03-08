# IkLearnEdge - Comprehensive Technical Audit Report

**Audit Date:** March 8, 2026  
**Status:** Complete  
**Overall Health:** ⚠️ CRITICAL - Multiple mismatches requiring urgent fixes

---

## EXECUTIVE SUMMARY

This audit identifies **22 critical/high-priority mismatches** between frontend expectations, backend implementations, and database schemas. These mismatches will cause runtime errors, data display issues, and broken features. The primary issues are:

1. **Response Structure Inconsistencies** (9 issues) - APIs return differently structured data than frontend expects
2. **Field Name Mismatches** (8 issues) - snake_case in database/backend vs camelCase in frontend
3. **Missing Fields** (3 issues) - Frontend expects fields that don't exist in database
4. **Type Mismatches** (2 issues) - ID format and data type inconsistencies

---

## SECTION 1: VERIFIED MATCHES (Working Correctly) ✅

### Authentication System
- ✅ User registration and login flow works correctly
- ✅ JWT token generation and validation
- ✅ Password hashing with bcrypt
- ✅ Role-based access control middleware
- ✅ Auth endpoints (`/auth/login`, `/auth/register`, `/auth/me`, `/auth/profile`, `/auth/change-password`) match frontend API calls

### Subject Management
- ✅ Subject creation with pricing tiers
- ✅ Public subjects endpoint returns active subjects
- ✅ Subject queries with pricing data
- ✅ Subject-grade-level price lookups

### Booking System
- ✅ Booking creation with price calculation
- ✅ Booking status workflow (`pending_payment` → `payment_under_review` → `confirmed` → `completed`)
- ✅ Student-to-booking relationship and authorization

### Payment Workflow
- ✅ Payment proof upload and storage
- ✅ Payment verification system (admin approval/rejection)
- ✅ Cascade deletion of payment proofs with bookings

### Database Schema
- ✅ Proper foreign key relationships
- ✅ Unique constraints on teacher_subjects
- ✅ Index creation for performance
- ✅ Automatic `updated_at` timestamp triggers

---

## SECTION 2: CRITICAL MISMATCHES BY CATEGORY

### 🔴 CRITICAL: Response Structure Wrapping (Impact: RUNTIME ERRORS)

#### MISMATCH #1: Student Profile Response Structure
**File:** [StudentDashboard.tsx](app/src/pages/dashboard/StudentDashboard.tsx#L70)  
**Severity:** CRITICAL  
**Priority:** P0

**Frontend Expects:**
```typescript
const studentData = await studentsAPI.getProfile();
setStudent(studentData.student);  // Expects .student property
```

**Backend Actually Returns (Line 17 - students.js):**
```javascript
res.json({
  success: true,
  data: result.rows[0]  // Returns .data property, not .student
});
```

**Issue:** Frontend looks for `studentData.student` but backend returns `studentData.data`  
**Fix Required:** Either wrap backend response in `student` property OR change frontend to use `.data`

---

#### MISMATCH #2: Teachers List Response Structure
**File:** [StudentDashboard.tsx](app/src/pages/dashboard/StudentDashboard.tsx#L81)  
**Severity:** CRITICAL  
**Priority:** P0

**Frontend Expects:**
```typescript
const teachersData = await teachersAPI.getAll();
setTeachers(teachersData.teachers || []);  // Expects .teachers property
```

**Backend Actually Returns (Line 48 - teachers.js):**
```javascript
res.json({
  success: true,
  count: result.rows.length,
  data: result.rows  // Returns .data, not .teachers
});
```

**Issue:** Frontend accesses `teachersData.teachers` but backend returns `teachersData.data`  
**Fix Required:** Change frontend to use `.data` property OR backend to wrap as `.teachers`

---

#### MISMATCH #3: Subjects List Response Structure
**File:** [StudentDashboard.tsx](app/src/pages/dashboard/StudentDashboard.tsx#L84)  
**Severity:** CRITICAL  
**Priority:** P0

**Frontend Expects:**
```typescript
const subjectsData = await subjectsAPI.getAll();
setSubjects(subjectsData.subjects || []);  // Expects .subjects property
```

**Backend Actually Returns (Line 19 - subjects.js):**
```javascript
res.json({
  success: true,
  data: subjectsWithPricing  // Returns .data array, not .subjects
});
```

**Issue:** Frontend accesses `.subjects` but backend returns `.data`  
**Fix Required:** Change frontend OR backend response wrapping

---

#### MISMATCH #4: Bookings List Response Structure
**File:** [StudentDashboard.tsx](app/src/pages/dashboard/StudentDashboard.tsx#L87)  
**Severity:** CRITICAL  
**Priority:** P0

**Frontend Expects:**
```typescript
const bookingsData = await bookingsAPI.getAll();
setBookings(bookingsData.bookings || []);  // Expects .bookings property
```

**Backend Actually Returns (Line 63 - bookings.js):**
```javascript
res.json({
  success: true,
  count: result.rows.length,
  data: result.rows  // Returns .data, not .bookings
});
```

**Issue:** Frontend accesses `.bookings` but backend returns `.data`  
**Fix Required:** Standardize response wrapping

---

#### MISMATCH #5: Admin Stats Response Structure
**File:** [AdminDashboard.tsx](app/src/pages/dashboard/AdminDashboard.tsx#L43)  
**Severity:** HIGH  
**Priority:** P1

**Frontend Code (Line 43-46):**
```typescript
const stats = await adminAPI.getStats();
setStats(stats.data || stats);  // Expects stats.data
```

**Backend Actually Returns (Line 25 - admin.js):**
```javascript
res.json({
  success: true,
  data: {
    totalTeachers: ...,
    ...
  }
});
```

**Status:** ✅ Currently works (frontend has fallback: `stats.data || stats`)  
**Risk:** Fragile - relies on fallback

---

#### MISMATCH #6: Admin Pending Verifications Response
**File:** [AdminDashboard.tsx](app/src/pages/dashboard/AdminDashboard.tsx#L61)  
**Severity:** CRITICAL  
**Priority:** P0

**Frontend Expects:**
```typescript
const teachersData = await teachersAPI.getAllAdmin();
setPendingVerifications(allTeachers.filter(...));  // Expects array of teachers
```

**Backend **Actually Returns `data` array with ALL teachers:**
```javascript
// teachers.js line 70-77
res.json({
  success: true,
  count: result.rows.length,
  data: result.rows  // Array of ALL teachers, not wrapped
});
```

**Issue:** Response structure is inconsistent - no `.teachers` wrapper  
**Fix Required:** Standardize to consistent response wrapping

---

#### MISMATCH #7: Payment Proofs Response 
**File:** [StudentDashboard.tsx](page references payment data)  
**Severity:** HIGH  
**Priority:** P1

**Backend Return (payments.js Line 28):**
```javascript
res.json({
  success: true,
  count: result.rows.length,
  data: result.rows  // Direct array
});
```

**Frontend May Expect:** Various response structures depending on context

---

### 🟠 HIGH: Field Name Convention Mismatches (snake_case vs camelCase)

#### MISMATCH #8: Profile Picture Field Name
**Files Affected:**  
- Backend: All routes use `profile_picture` (snake_case)
- Frontend Types: [index.ts](app/src/types/index.ts#L7) expects `profilePicture`
- Frontend Components: Multiple dashboards expect `profilePicture`

**Database Column:** `profile_picture` (VARCHAR)  

**Backend Query (auth.js Line 36, 45):**
```javascript
'SELECT id, email, name, role, profile_picture, password_hash FROM users'
// Returns: { profile_picture: "..." }
```

**Frontend Types (index.ts Line 7):**
```typescript
export interface User {
  profilePicture?: string;  // camelCase expected
}
```

**Frontend Usage (StudentDashboard.tsx Line 75):**
```typescript
setSettingsForm({
  profilePicture: studentData.student?.profilePicture || ''  // Expects camelCase
});
```

**Impact:** `profilePicture` will be `undefined` in frontend, showing no pictures  
**Fix Required:** Either update database to use camelCase (complex) OR normalize responses in backend OR use middleware to convert

---

#### MISMATCH #9: Verification Status Field Name
**Files Affected:**  
- Database: `verification_status` (snake_case)
- Backend: Returns `verification_status` (snake_case)
- Frontend Types: Expected `verificationStatus` (camelCase)

**Database Column:** `verification_status`

**Backend Query (teachers.js Line 55):**
```javascript
t.verification_status  // Returns snake_case
```

**Frontend Usage (StudentDashboard.tsx Line 97):**
```typescript
.filter(t => t.isLive && t.verificationStatus === 'approved')
// "verificationStatus" is undefined! It's "verification_status" from API
```

**Impact:** Filter condition fails - teachers show incorrect status  
**Fix Required:** Normalize field names in backend response or transform in frontend

---

#### MISMATCH #10: is_live Field Name
**Files Affected:**  
- Database: `is_live` (snake_case)  
- Backend: Returns `is_live`
- Frontend: Expects `isLive` (camelCase)

**Frontend Usage (StudentDashboard.tsx Line 96):**
```typescript
.filter(t => t.isLive && t.verificationStatus === 'approved')
// "isLive" is undefined! Backend returns "is_live"
```

**Impact:** Teacher filtering broken - shows all teachers regardless of live status  
**Fix Required:** Normalize field names

---

#### MISMATCH #11: Meeting Link Field
**Database:** `meeting_link`  
**Backend:** Returns `meeting_link`  
**Frontend Types:** Expects `meetingLink`

**Backend Query (teachers.js Line 55):**
```javascript
t.meeting_link
```

**Frontend Types (index.ts Line 40):**
```typescript
meetingLink?: string;
```

**Impact:** Meeting link data will be undefined in frontend  
**Fix Required:** Normalize field names

---

#### MISMATCH #12: Price Per Hour Field
**Database:** `price_per_hour` (DECIMAL)  
**Backend Returns:** `price_per_hour` (snake_case)  
**Frontend Types (index.ts Line 21):** Expects `pricePerHour`

**Backend Query (subjects.js Line 25):**
```javascript
'SELECT id, grade_level, price_per_hour FROM pricing_tiers'
// Returns: { price_per_hour: 15 }
```

**Frontend Type (index.ts Line 21):**
```typescript
export interface PricingTier {
  pricePerHour: number;  // camelCase
}
```

**Impact:** Pricing display broken - prices undefined in UI  
**Fix Required:** Normalize field names in backend response

---

#### MISMATCH #13: Subject Tier Grade Level Format
**Database:** `grade_level` VARCHAR  
**Backend Query:** Returns `grade_level` (snake_case)  
**Frontend Types (index.ts Line 20):** `gradeLevel`

**Backend Response:**
```javascript
{ grade_level: "Grade 1-5 (Primary)" }
```

**Frontend Type:**
```typescript
gradeLevel: string;
```

**Impact:** Grade level display broken  
**Fix Required:** Normalize during response building

---

#### MISMATCH #14: Created At / Updated At Fields
**Database:** `created_at`, `updated_at` (snake_case)  
**Backend:** Returns `created_at`, `updated_at`  
**Frontend Types:** May expect `createdAt`, `updatedAt`

**Database Schema:**
```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

**Backend Returns (teacher queries):**
```javascript
t.created_at
```

**Frontend Types (index.ts Line 54):**
```typescript
createdAt: Date;
updatedAt: Date;
```

**Impact:** Date fields may be undefined in UI  
**Fix Required:** Normalize field naming

---

#### MISMATCH #15: Grade Level Field in Students
**Database:** `grade_level` (VARCHAR)  
**Backend:** Returns `grade_level`  
**Frontend:** Expects `gradeLevel` in student object

**Database Schema:**
```sql
CREATE TABLE students (
  ...
  grade_level VARCHAR(100),
  ...
);
```

**Backend Query (students.js Line 10):**
```javascript
s.grade_level  // Returns snake_case
```

**Frontend Usage (StudentDashboard.tsx Line 75):**
```typescript
gradeLevel: studentData.student?.gradeLevel || ''  // Expects camelCase
```

**Impact:** Grade level input field will be empty despite having value in database  
**Fix Required:** Normalize field names

---

### 🔴 CRITICAL: Missing Fields in Database Schema

#### MISMATCH #16: Phone Number Field Missing (CRITICAL - Multiple Files)
**Files Affected:**  
- [StudentDashboard.tsx](app/src/pages/dashboard/StudentDashboard.tsx#L75)
- [TeacherDashboard.tsx](app/src/pages/dashboard/TeacherDashboard.tsx)

**Frontend Code (StudentDashboard.tsx Line 75):**
```typescript
const settingsForm = useState({
  name: '',
  email: '',
  phoneNumber: '',  // ← NOT IN DATABASE!
  gradeLevel: '',
  profilePicture: ''
});

// Line 137:
phoneNumber: studentData.student?.phoneNumber || '',
```

**Database Schema:** NO `phone_number` column in `students` table  
**Backend Response:** Cannot return what doesn't exist

**Issue:** Frontend tries to save/display phone number but column doesn't exist  
**Fix Required:**  
1. Add `phone_number VARCHAR(20)` to students table  
2. Add `phone_number VARCHAR(20)` to teachers table  
3. Update backend routes to handle these fields  
4. Create migration

---

#### MISMATCH #17: Teacher Documents Fields - Response Format Issue
**Frontend Types (index.ts Line 38-46):**
```typescript
highestDegree: {
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
};
teachingCertificates: {...}[];
identityDocument: {...};
```

**Backend Query (teachers.js Line 47 - for /api/teachers/:id):**
```javascript
// Queries get documents separately:
const documentsResult = await query(
  'SELECT id, type, file_url, file_name FROM documents WHERE teacher_id = $1',
);
// Returns flat array of documents, not organized by type!
```

**Database Schema:**
```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  teacher_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('degree', 'certificate', 'identity')),
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Issue:** Documents returned as flat array `[{ type: 'degree', file_url: ... }, ...]` but frontend expects organized structure with `highestDegree`, `teachingCertificates`, `identityDocument`  

**Backend Response (actually returns):**
```javascript
{
  documents: [
    { id: 1, type: 'degree', file_url: '...', file_name: '...', uploaded_at: '...' },
    { id: 2, type: 'certificate', file_url: '...', file_name: '...', uploaded_at: '...' },
    { id: 3, type: 'identity', file_url: '...', file_name: '...', uploaded_at: '...' }
  ]
}
```

**Frontend Expected:**
```javascript
{
  highestDegree: { fileName: '...', fileUrl: '...', uploadedAt: '...' },
  teachingCertificates: [{ fileName: '...', fileUrl: '...', uploadedAt: '...' }],
  identityDocument: { type: 'cnic'|'passport', fileName: '...', fileUrl: '...', uploadedAt: '...' }
}
```

**Impact:** Documents won't display properly in teacher profiles/admin  
**Fix Required:**  
1. Transform documents in backend before returning  
2. Convert snake_case field names to camelCase  
3. Organize by type

---

#### MISMATCH #18: Availability Slot Format Issues  
**Frontend Types (index.ts Line 50-57):**
```typescript
export interface AvailabilitySlot {
  id: string;
  day: 'monday' | 'tuesday' | ...;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}
```

**Database Schema:**
```sql
CREATE TABLE availability (
  id SERIAL PRIMARY KEY,
  day VARCHAR(20) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true
);
```

**Backend Query (teachers.js):**
```javascript
'SELECT id, day, start_time, end_time, is_available FROM availability'
// Returns: { start_time: "09:00:00", end_time: "17:00:00", is_available: true }
```

**Field Name Mismatches:**
- `start_time` vs `startTime`
- `end_time` vs `endTime`  
- `is_available` vs `isAvailable`

**Impact:** Availability times won't display correctly  
**Fix Required:** Convert field names in response

---

### 🟡 MEDIUM: Type and Format Mismatches

#### MISMATCH #19: ID Type Inconsistency (Integer vs String)
**Database:** All IDs are SERIAL (INTEGER)  
**Frontend Types (index.ts):** Expect `string`

**Database Schema:**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,  -- INTEGER
  ...
);
```

**Frontend Types (index.ts Line 3):**
```typescript
export interface User {
  id: string;  // String expected!
  ...
}
```

**Backend Returns (auth.js Line 36):**
```javascript
SELECT id FROM users  -- Returns: { id: 123 } (integer)
```

**Frontend Usage (AdminDashboard.tsx Line 115):**
```typescript
await teachersAPI.verify(teacherId, 'approved');  // teacherId is number from DB
```

**Impact:** ID format mismatch may cause issues with string operations in frontend  
**Fix Required:** Either coerce IDs to strings in backend OR change types to number

---

#### MISMATCH #20: Array Aggregation Format in Teachers Query
**Backend Query (teachers.js Line 55):**
```javascript
ARRAY_AGG(DISTINCT s.name) as subject_names,
ARRAY_AGG(DISTINCT s.id) as subject_ids
```

**Actual Database Returns:** Integer array for IDs `[1, 2, 3]`  
**Frontend Usage (StudentDashboard.tsx Line 106):**
```typescript
const sub = subjects.find((subj: any) => subj.id === s);
// 's' is the string representation from the array
```

**Issue:** Mixed types - subject IDs are numbers but treated as strings  
**Fix Required:** Ensure consistent type handling

---

#### MISMATCH #21: Payment Proof Status Endpoints
**Admin API Endpoint (admin.js Line 128 - pending API):**
```javascript
router.get('/verifications/pending', ...)
```

**But AdminDashboard (Line 184) calls:**
```typescript
await paymentsAPI.verify(paymentId, 'verified');
```

**Backend payments.js Line 148 expects:**
```javascript
if (!['approved', 'rejected'].includes(status)) {
  return res.status(400).json(...);
}
```

**Issue:** Frontend sends 'verified' but backend expects 'approved' or 'rejected'  
**Line:** [AdminDashboard.tsx, Line 184](app/src/pages/dashboard/AdminDashboard.tsx#L184)  
**Actual Error:** Will fail validation

**Fix Required:** Change frontend to use 'approved' instead of 'verified'

---

#### MISMATCH #22: Subject Tutor Count Field
**Database Query (subjects.js Line 12):**
```javascript
COUNT(DISTINCT ts.teacher_id) as tutor_count
```

**Backend Returns:** `{ tutor_count: 5 }`  
**Frontend Types (index.ts Line 14):** `tutorCount`  
**Frontend Usage:** May reference `subject.tutorCount`

**Impact:** Tutor count will be undefined  
**Fix Required:** Normalize field name

---

## SECTION 3: ERROR SUMMARY TABLE

| # | Component | Severity | Issue Type | FrontEnd File | Backend File | Line # | Fix Complexity |
|---|-----------|----------|-----------|---|---|---|---|
| 1 | Student Profile | 🔴 CRITICAL | Response Structure | StudentDashboard.tsx | students.js | 70/17 | EASY |
| 2 | Teachers List | 🔴 CRITICAL | Response Structure | StudentDashboard.tsx | teachers.js | 81/48 | EASY |
| 3 | Subjects List | 🔴 CRITICAL | Response Structure | StudentDashboard.tsx | subjects.js | 84/19 | EASY |
| 4 | Bookings List | 🔴 CRITICAL | Response Structure | StudentDashboard.tsx | bookings.js | 87/63 | EASY |
| 5 | Admin Stats | 🟠 HIGH | Response Structure | AdminDashboard.tsx | admin.js | 43/25 | EASY |
| 6 | Pending Verifications | 🔴 CRITICAL | Response Structure | AdminDashboard.tsx | teachers.js | 61/70 | EASY |
| 7 | Payment Response | 🟠 HIGH | Response Structure | Multiple | payments.js | -/28 | EASY |
| 8 | Profile Picture | 🟠 HIGH | Field Name (snake_case) | Multiple | auth.js | 75/36 | MEDIUM |
| 9 | Verification Status | 🟠 HIGH | Field Name (snake_case) | StudentDashboard | teachers.js | 97/55 | MEDIUM |
| 10 | Is Live | 🟠 HIGH | Field Name (snake_case) | StudentDashboard | teachers.js | 96/55 | MEDIUM |
| 11 | Meeting Link | 🟠 HIGH | Field Name (snake_case) | Multiple | teachers.js | -/55 | MEDIUM |
| 12 | Price Per Hour | 🟠 HIGH | Field Name (snake_case) | StudentDashboard | subjects.js | 104/25 | MEDIUM |
| 13 | Grade Level (Pricing) | 🟠 HIGH | Field Name (snake_case) | StudentDashboard | subjects.js | 104/25 | MEDIUM |
| 14 | Timestamps | 🟡 MEDIUM | Field Name (snake_case) | Multiple | Multiple | -/- | HARD |
| 15 | Grade Level (Student) | 🟠 HIGH | Field Name (snake_case) | StudentDashboard | students.js | 75/10 | MEDIUM |
| 16 | Phone Number | 🔴 CRITICAL | Missing Field | StudentDashboard/TeacherDash | Database | 75/-  | HARD |
| 17 | Documents Format | 🟠 HIGH | Response Structure | Teacher Profile | teachers.js | -/47 | HARD |
| 18 | Availability Slots | 🟠 HIGH | Field Name (snake_case) | Teacher Profile | teachers.js | -/47 | MEDIUM |
| 19 | ID Type | 🟡 MEDIUM | Type Mismatch | Multiple | auth.js | -/36 | MEDIUM |
| 20 | Array Aggregation | 🟡 MEDIUM | Type Mismatch | StudentDashboard | teachers.js | 106/55 | LOW |
| 21 | Payment Status | 🟠 HIGH | Value Mismatch | AdminDashboard | payments.js | 184/148 | EASY |
| 22 | Tutor Count | 🟢 LOW | Field Name | Admin | subjects.js | -/12 | EASY |

---

## SECTION 4: API ENDPOINTS ANALYSIS

### Frontend Expected vs Backend Actual Responses

#### Endpoint: `/api/teachers`
**Frontend Expects:**
```typescript
{
  teachers: [
    {
      id: "1",
      name: "John",
      profilePicture: "...",
      isLive: true,
      verificationStatus: "approved",
      subjects: ["1", "2"],
      meetingLink: "..."
    }
  ]
}
```

**Backend Actually Returns (Line 48-54):**
```javascript
{
  success: true,
  count: 1,
  data: [
    {
      id: 1,  // Integer, not string
      name: "John",
      profile_picture: "...",  // snake_case
      is_live: true,  // snake_case  
      verification_status: "approved",  // snake_case
      subject_names: ["Math"],  // Array of names, not IDs
      subject_ids: [1],  // Integers, not strings
      meeting_link: "..."  // snake_case
    }
  ]
}
```

**Specific Mismatches:**
- ✗ `data` vs `teachers` wrapper
- ✗ `id` integer vs string
- ✗ `profile_picture` vs `profilePicture`
- ✗ `is_live` vs `isLive`
- ✗ `verification_status` vs `verificationStatus`
- ✗ `meeting_link` vs `meetingLink`

---

#### Endpoint: `/api/students/profile`
**Frontend Expects:**
```typescript
{
  student: {
    id: "1",
    userId: "1",
    name: "Jane",
    email: "jane@example.com",
    gradeLevel: "O-Level",
    profilePicture: "...",
    parentContact: "...",
    location: "...",
    phoneNumber: "...",  // DOESN'T EXIST
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01"
  }
}
```

**Backend Actually Returns (Line 16):**
```javascript
{
  success: true,
  data: {
    id: 1,
    user_id: 1,
    name: "Jane",
    email: "jane@example.com",
    grade_level: "O-Level",
    profile_picture: "...",
    parent_contact: "...",
    location: "...",
    // No phoneNumber field!
  }
}
```

**Specific Mismatches:**
- ✗ `.data` vs `.student` wrapper
- ✗ All field names in snake_case
- ✗ Missing `phoneNumber` field
- ✗ No `createdAt`/`updatedAt` fields

---

#### Endpoint: `/api/subjects`
**Frontend Expects:**
```typescript
{
  subjects: [
    {
      id: "1",
      name: "Math",
      description: "...",
      image: "...",
      isActive: true,
      tutorCount: 5,
      pricingTiers: [
        {
          id: "1",
          subjectId: "1",
          gradeLevel: "O-Level",
          pricePerHour: 28
        }
      ]
    }
  ]
}
```

**Backend Actually Returns (Line 19-31):**
```javascript
{
  success: true,
  data: [
    {
      id: 1,
      name: "Math",
      description: "...",
      image: "...",
      is_active: true,  // snake_case
      tutor_count: 5,  // snake_case
      pricingTiers: [
        {
          id: 1,
          subject_id: 1,  // snake_case
          grade_level: "O-Level",  // snake_case
          price_per_hour: 28  // snake_case
        }
      ]
    }
  ]
}
```

**Specific Mismatches:**
- ✗ `.data` vs `.subjects` wrapper
- ✗ `is_active` vs `isActive`
- ✗ `tutor_count` vs `tutorCount`
- ✗ `subject_id` vs `subjectId`
- ✗ `grade_level` vs `gradeLevel`
- ✗ `price_per_hour` vs `pricePerHour`

---

## SECTION 5: RECOMMENDED FIXES (Priority Order)

### PHASE 1: CRITICAL FIXES (Deploy Immediately)
**Estimated Time:** 2-4 hours

1. **Fix Response Wrapping** - Standardize all API responses
   - Wrap arrays in consistent property names (`data`, `teachers`, `subjects`, etc.)
   - Match frontend expectations or update frontend to use `data`
   - Affects: 6 endpoints (highest impact)

2. **Fix Phone Number Field** - Enable text input for phone numbers
   - Add migration to create `phone_number` column in `students` and `teachers` tables
   - Update backend routes to handle these fields
   - Estimated time: 30 minutes

3. **Fix Payment Status Value** - AdminDashboard calls endpoint with 'verified'
   - Line: [AdminDashboard.tsx#184](app/src/pages/dashboard/AdminDashboard.tsx#L184)
   - Change `'verified'` to `'approved'`
   - Estimated time: 5 minutes

### PHASE 2: HIGH PRIORITY FIXES (Deploy within 1 week)
**Estimated Time:** 4-6 hours

4. **Normalize Field Names** - Convert all snake_case to camelCase in responses
   - Create response formatter middleware for all routes
   - OR: Update TypeScript types to use snake_case
   - Recommendation: Use formatter middleware (more maintainable)
   - Affected fields: `profile_picture`, `verification_status`, `is_live`, `meeting_link`, `price_per_hour`, `grade_level`, `is_available`, `start_time`, `end_time`, `tutor_count`, `parent_contact`

5. **Fix Documents Response Format** - Transform documents array for teacher profiles
   - Organize documents by type (degree, certificates, identity)
   - Convert field names to camelCase
   - Estimated time: 45 minutes

6. **Fix ID Type Consistency** - Ensure all IDs are strings in responses
   - Use `.toString()` in all queries OR
   - Update TypeScript types to accept number
   - Recommendation: Convert to strings (standard practice)

### PHASE 3: MEDIUM PRIORITY FIXES (Deploy within 2 weeks)
**Estimated Time:** 2-3 hours

7. **Add CreatedAt/UpdatedAt to User Responses** - Include timestamps in all user-related queries

8. **Fix Availability Slot Response** - Convert to camelCase format

9. **Update Admin Verification Endpoint** - Mentions fields that don't exist (`qualification`, `id_document`)
   - Confirm required fields with product team
   - Add/remove fields as needed

---

## SECTION 6: MITIGATION STRATEGIES

### Strategy 1: Backend Response Formatter Middleware (Recommended)
```javascript
// Create response formatter to convert snake_case to camelCase
function toKebabCase(obj) {
  // Recursively convert all snake_case keys to camelCase
}

// Apply to all routes
app.use('/api', responseFormatter);
```
**Pros:**
- Centralized fix for all field name issues
- No frontend changes needed
- Consistent across entire API

**Cons:**
- Adds slight performance overhead
- Need to test thoroughly

---

### Strategy 2: Frontend Data Transformation
```typescript
// Transform API response to match expected types
function normalizeTeacherData(teacher) {
  return {
    ...teacher,
    profilePicture: teacher.profile_picture,
    isLive: teacher.is_live,
    verificationStatus: teacher.verification_status,
  };
}
```

**Pros:**
- No backend changes needed
- Quick implementation

**Cons:**
- Duplicates transformation logic across components
- Harder to maintain
- Doesn't fix response structure issues

---

### Strategy 3: Database Migration to camelCase
**Not Recommended** - Too complex, breaking changes

---

## SECTION 7: TESTING CHECKLIST

After fixes, test:

- [ ] Student profile loads with all fields
- [ ] Teacher list filters correctly (`isLive`, `verificationStatus`)
- [ ] Subject prices display correctly for each grade level
- [ ] Teacher documents display in proper sections (degree, certificates, identity)
- [ ] Availability schedule shows correct time format
- [ ] Phone numbers can be saved to student/teacher profiles
- [ ] Admin can verify teachers successfully
- [ ] Admin can approve/reject payments (with 'approved'/'rejected' status)
- [ ] All timestamps display correctly (createdAt, updatedAt)
- [ ] Teacher stats calculate correctly
- [ ] Booking creation calculates correct total amount
- [ ] IDs work correctly in all operations

---

## SECTION 8: SPECIFIC CODE CHANGES NEEDED

### Backend Changes (Quick Reference)

**File: backend/src/models/database.js** (No changes needed)

**File: backend/database/migrations/001_initial_schema.sql**
```sql
-- Add missing phone_number field to students table
ALTER TABLE students ADD COLUMN phone_number VARCHAR(20);

-- Add missing phone_number field to teachers table  
ALTER TABLE teachers ADD COLUMN phone_number VARCHAR(20);
```

**File: backend/src/routes/auth.js**
- Line 36: Also select `created_at, updated_at`
- Update response formatting if using middleware approach

**File: backend/src/routes/students.js**
- Line 10-14: Include phone_number in SELECT
- Line 34-40: Handle phone_number in UPDATE

**File: backend/src/routes/teachers.js**
- Line 55-62: Include phone_number in SELECT
- Line 40-50: Wrap documents response properly
- Lines with availability: Convert to camelCase

**File: backend/src/routes/admin.js**
- Line 184: Already expects 'approved'/'rejected' (good)

---

## SECTION 9: COST-BENEFIT ANALYSIS

### Doing Nothing
- **Cost:** Broken features, poor user experience, data loss potential
- **Risk:** HIGH - System is not production-ready
- **Users Affected:** ALL

### Minimal Fix (Only Critical Issues)
- **Effort:** 2-4 hours
- **Cost:** $200-400 (at standard dev rates)
- **Features Fixed:** 5/6 core flows
- **Remaining Issues:** Field names, documentation format
- **Recommendation:** NOT SUFFICIENT

### Complete Fix (All Issues)
- **Effort:** 8-12 hours
- **Cost:** $800-1200
- **Features Fixed:** All known issues
- **Benefits:** Production-ready, maintainable, scalable
- **Recommendation:** STRONGLY RECOMMENDED

---

## CONCLUSION

**Overall Assessment:** ⚠️ **NOT PRODUCTION-READY**

The iklearnedge system has significant mismatches that will cause runtime errors and broken features across all user types (admin, students, teachers). The most critical issues are:

1. **Response wrapping inconsistencies** affect data loading
2. **Field naming mismatches** make data appear null/undefined
3. **Missing database fields** prevent feature functionality
4. **Type inconsistencies** cause logic failures

**Estimated time to resolution:** 8-12 hours for complete fix

**Estimated time to minimal fix:** 2-4 hours

**Recommendation:** Execute PHASE 1 and PHASE 2 fixes before production deployment.

---

**Audit Conducted:** March 8, 2026  
**Auditor:** Comprehensive Technical Analysis  
**Status:** Ready for Implementation
