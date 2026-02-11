# HOW TO EDIT - Complete Guide for Non-Coders

## 📚 Table of Contents
1. [Understanding the File Structure](#file-structure)
2. [How to Change Prices (Admin Controlled)](#change-prices)
3. [How to Add/Remove Subjects](#add-remove-subjects)
4. [How to Change Colors/Design](#change-design)
5. [How to Change Text/Content](#change-text)
6. [How to Add New Teachers/Students](#add-users)
7. [How to Deploy Changes](#deploy-changes)

---

## 📁 File Structure <a name="file-structure"></a>

```
/mnt/okcomputer/output/app/src/
│
├── data/
│   └── mockData.ts          ← ← ← MOST IMPORTANT FILE
│                              (Contains all data: prices, subjects, users)
│
├── pages/dashboard/
│   ├── AdminDashboard.tsx   ← Admin panel
│   ├── TeacherDashboard.tsx ← Teacher panel
│   └── StudentDashboard.tsx ← Student panel
│
├── sections/
│   ├── Navigation.tsx       ← Top menu
│   ├── Hero.tsx             ← Homepage banner
│   ├── HowItWorks.tsx       ← Steps section
│   ├── Testimonials.tsx     ← Reviews section
│   ├── Subjects.tsx         ← Subjects grid on homepage
│   └── Footer.tsx           ← Bottom section
│
├── types/
│   └── index.ts             ← Data structure definitions
│
└── index.css                ← Colors and styles
```

---

## 💰 How to Change Prices (Admin Controlled) <a name="change-prices"></a>

### File to Edit: `/mnt/okcomputer/output/app/src/data/mockData.ts`

### Step 1: Find the Pricing Section
Look for this section in the file (around line 30-80):

```typescript
// Admin-Controlled Pricing Tiers by Subject and Grade
export const pricingTiers: PricingTier[] = [
  // Math Pricing
  { id: '1', subjectId: '1', gradeLevel: 'Grade 1-5 (Primary)', pricePerHour: 15 },
  { id: '2', subjectId: '1', gradeLevel: 'Grade 6-8 (Middle)', pricePerHour: 18 },
  ...
];
```

### Step 2: Understanding the Structure
Each price line looks like this:
```typescript
{ id: '1', subjectId: '1', gradeLevel: 'Grade 1-5 (Primary)', pricePerHour: 15 },
```

| Part | Meaning | What to Change |
|------|---------|----------------|
| `id` | Unique number | Keep it unique, don't change existing |
| `subjectId` | Which subject | '1'=Math, '2'=Physics, etc. |
| `gradeLevel` | Student grade | Don't change this text |
| `pricePerHour` | **THE PRICE** | **Change this number!** |

### Step 3: Change a Price

**Example: Change Math price for O-Level from $28 to $35**

**BEFORE:**
```typescript
{ id: '4', subjectId: '1', gradeLevel: 'O-Level', pricePerHour: 28 },
```

**AFTER:**
```typescript
{ id: '4', subjectId: '1', gradeLevel: 'O-Level', pricePerHour: 35 },
```

### Subject ID Reference:
| ID | Subject |
|----|---------|
| '1' | Math |
| '2' | Physics |
| '3' | Chemistry |
| '4' | English |
| '5' | Science |
| '6' | IELTS |
| '7' | SAT |
| '8' | Biology |
| '9' | Computer Science |

### Grade Levels Available:
- `Grade 1-5 (Primary)`
- `Grade 6-8 (Middle)`
- `Grade 9-10 (Secondary)`
- `O-Level`
- `A-Level`
- `University/College`
- `Adult Learning`

---

## 📖 How to Add/Remove Subjects <a name="add-remove-subjects"></a>

### File to Edit: `/mnt/okcomputer/output/app/src/data/mockData.ts`

### To ADD a New Subject:

#### Step 1: Add Pricing Tiers (in `pricingTiers` array)
```typescript
// History Pricing (NEW SUBJECT)
{ id: '39', subjectId: '10', gradeLevel: 'Grade 6-8 (Middle)', pricePerHour: 16 },
{ id: '40', subjectId: '10', gradeLevel: 'Grade 9-10 (Secondary)', pricePerHour: 19 },
{ id: '41', subjectId: '10', gradeLevel: 'O-Level', pricePerHour: 24 },
```

#### Step 2: Add Subject Definition (in `subjects` array)
```typescript
{
  id: '10',                          // NEW unique ID
  name: 'History',                   // Subject name
  description: 'Learn world history from ancient civilizations to modern times.',
  image: '/subject-english.jpg',     // Use existing image or add new
  tutorCount: 0,                     // Start with 0
  isActive: true,                    // true = visible, false = hidden
  pricingTiers: pricingTiers.filter(p => p.subjectId === '10')
},
```

#### Step 3: Add Subject Image (Optional)
1. Add image to `/mnt/okcomputer/output/app/public/`
2. Update the `image` path: `'/subject-history.jpg'`

### To REMOVE/Hide a Subject:

**Option 1: Hide it (keeps data)**
```typescript
{
  id: '7',
  name: 'SAT',
  ...
  isActive: false,  // ← Change from true to false
},
```

**Option 2: Delete completely**
1. Remove from `subjects` array
2. Remove related pricing tiers from `pricingTiers` array

---

## 🎨 How to Change Colors/Design <a name="change-design"></a>

### File to Edit: `/mnt/okcomputer/output/app/src/index.css`

### Main Color Variables (at the top):
```css
:root {
  --primary: #f5a623;        /* Orange/Gold - Main brand color */
  --secondary: #4a4a4a;      /* Dark Gray - Text color */
  --background: #ffffff;     /* White - Background */
  --background-light: #f5f5f5; /* Light Gray - Section backgrounds */
  --text: #333333;           /* Body text */
  --border: #e0e0e0;         /* Borders */
  --success: #28a745;        /* Green - Success messages */
  --error: #dc3545;          /* Red - Error messages */
}
```

### Change the Main Orange Color:

**BEFORE:**
```css
--primary: #f5a623;
```

**AFTER (Blue example):**
```css
--primary: #2563eb;
```

### Common Color Formats:
| Format | Example | Use For |
|--------|---------|---------|
| Hex | `#f5a623` | Solid colors |
| RGB | `rgb(245, 166, 35)` | With transparency |
| RGBA | `rgba(245, 166, 35, 0.5)` | Semi-transparent |

### Color Picker Tool:
Visit https://colorpicker.me to find colors!

---

## ✏️ How to Change Text/Content <a name="change-text"></a>

### Homepage Text

#### Hero Section (Main Banner)
**File:** `/mnt/okcomputer/output/app/src/sections/Hero.tsx`

Find and change:
```typescript
<h1>
  <span className="word inline-block">International</span>
  <span className="word inline-block">Premier</span>
  ...
</h1>
```

#### How It Works Section
**File:** `/mnt/okcomputer/output/app/src/sections/HowItWorks.tsx`

Find the `steps` array and edit:
```typescript
const steps = [
  {
    number: '1',
    title: 'Get Started',        // ← Change this
    description: 'Register',      // ← Change this
    time: 'Takes few seconds',    // ← Change this
  },
  ...
];
```

#### Testimonials
**File:** `/mnt/okcomputer/output/app/src/sections/Testimonials.tsx`

```typescript
const testimonials = [
  {
    id: 1,
    name: 'Ahmed',                // ← Change name
    role: 'Grade 10 Student',     // ← Change role
    quote: 'IkLearnEdge made...',  // ← Change review text
  },
  ...
];
```

---

## 👥 How to Add New Teachers/Students <a name="add-users"></a>

### File to Edit: `/mnt/okcomputer/output/app/src/data/mockData.ts`

### Add a New Teacher:

In the `teachers` array, add:
```typescript
{
  id: '4',                                    // NEW unique ID
  userId: '8',                                // NEW unique user ID
  name: 'New Teacher Name',                   // Teacher's name
  email: 'newteacher@iklearnedge.com',        // Teacher's email
  bio: 'Experienced teacher with 5 years...', // Description
  subjects: ['1', '4'],                       // Subject IDs they teach
  profilePicture: '/testimonial-ahmed.jpg',   // Profile photo
  highestDegree: {
    fileName: 'degree.pdf',
    fileUrl: '/documents/degree4.pdf',
    uploadedAt: new Date('2024-03-01')
  },
  teachingCertificates: [
    {
      fileName: 'cert.pdf',
      fileUrl: '/documents/cert4.pdf',
      uploadedAt: new Date('2024-03-01')
    }
  ],
  identityDocument: {
    type: 'cnic',                             // or 'passport'
    fileName: 'cnic.jpg',
    fileUrl: '/documents/cnic4.jpg',
    uploadedAt: new Date('2024-03-01')
  },
  verificationStatus: 'approved',             // 'pending', 'approved', 'rejected'
  isLive: true,                               // true = visible to students
  meetingLink: 'https://zoom.us/j/1234567890',
  availability: [
    { id: '8', day: 'monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
  ],
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-03-01')
},
```

### Add a New Student:

In the `students` array, add:
```typescript
{
  id: '4',                                    // NEW unique ID
  userId: '9',                                // NEW unique user ID
  name: 'New Student Name',                   // Student's name
  email: 'newstudent@iklearnedge.com',        // Student's email
  gradeLevel: 'O-Level',                      // Their grade
  profilePicture: '/testimonial-sara.jpg',    // Profile photo
  parentContact: '+971501234567',             // Parent phone
  location: 'Dubai, UAE',                     // Location
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date('2024-03-01')
},
```

---

## 🚀 How to Deploy Changes <a name="deploy-changes"></a>

### Step 1: Save Your Changes
Make sure you've saved all files you edited.

### Step 2: Build the Project
Run this command in the terminal:
```bash
cd /mnt/okcomputer/output/app && npm run build
```

### Step 3: Copy Images (if you added new ones)
```bash
cp -r /mnt/okcomputer/output/app/public/* /mnt/okcomputer/output/app/dist/
```

### Step 4: Deploy
The deployment will happen automatically, or you can use:
```bash
vercel --prod
```

---

## 📝 Quick Reference Cheat Sheet

### Change Prices
```typescript
// In mockData.ts
{ id: '1', subjectId: '1', gradeLevel: 'O-Level', pricePerHour: 35 },
//                                              Change this ↑ number
```

### Add Subject
1. Add pricing tiers with new `subjectId`
2. Add subject to `subjects` array
3. Set `isActive: true`

### Hide Subject
```typescript
isActive: false,  // Instead of true
```

### Change Color
```css
/* In index.css */
--primary: #2563eb;  /* Change the hex code */
```

### Add Teacher
Copy existing teacher object, change:
- `id` (must be unique)
- `userId` (must be unique)
- `name`
- `email`
- `subjects` (array of subject IDs)

---

## ❓ Need Help?

### Common Issues:

**1. Build Error?**
- Check for missing commas `,`
- Check for extra/missing brackets `{}` or `[]`
- Check quotes are straight `"` not curly `"`

**2. Changes Not Showing?**
- Did you run `npm run build`?
- Did you copy images to `dist` folder?
- Clear browser cache (Ctrl+Shift+R)

**3. Wrong Price Showing?**
- Check `subjectId` matches the subject
- Check `gradeLevel` spelling exactly
- Check student's grade level in their profile

---

## 🔧 Tools You Might Need

1. **Color Picker:** https://colorpicker.me
2. **Image Editor:** https://photopea.com (free Photoshop)
3. **Code Editor:** Use any text editor
4. **File Upload:** Drag and drop to `/mnt/okcomputer/output/app/public/`

---

## 📞 Remember

- **ALWAYS** run `npm run build` after making changes
- **ALWAYS** copy images to `dist` folder after building
- **BACKUP** your files before making big changes
- **TEST** on the live site after deploying

---

**You Can Do It!** 💪

Even without coding knowledge, you can manage this platform by following these simple steps!
