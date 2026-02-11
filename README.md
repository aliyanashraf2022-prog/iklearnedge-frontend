# IkLearnEdge - Online Tutoring Platform

A complete web-based tutoring platform connecting teachers from Pakistan with students in Dubai.

## 🌟 Features

### For Students
- Browse and search verified teachers
- Filter by subject and grade level
- Book classes with admin-controlled pricing
- Upload payment proofs via bank transfer
- Join online classes via meeting links
- Track booking history and payments

### For Teachers
- Create professional profiles
- Upload verification documents (degree, ID, certificates)
- Set availability schedule
- Manage classes and students
- Get notified of new bookings
- Admin-controlled pricing (no price negotiation)

### For Admin
- Dashboard with platform statistics
- Approve/reject teacher verifications
- Manage subjects and pricing by grade level
- Verify payment proofs
- Manage all users
- View revenue reports

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │────▶│   Database      │
│   (React)       │◄────│   (Express)     │◄────│  (PostgreSQL)   │
│                 │     │                 │     │                 │
│  - Vercel       │     │  - Railway      │     │  - Supabase     │
│  - TypeScript   │     │  - Node.js      │     │  - Free Tier    │
│  - Tailwind CSS │     │  - JWT Auth     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │
         │              ┌────────┴────────┐
         │              │   Cloudinary    │
         │              │  (File Uploads) │
         │              └─────────────────┘
         │
         ▼
┌─────────────────┐
│   GitHub Repo   │
└─────────────────┘
```

## 📁 Project Structure

```
iklearnedge/
├── app/                          # Frontend Application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── context/             # React Context (Auth)
│   │   ├── data/                # Mock data (for development)
│   │   ├── pages/               # Page components
│   │   │   └── dashboard/       # Admin, Teacher, Student dashboards
│   │   ├── services/            # API service functions
│   │   ├── types/               # TypeScript type definitions
│   │   └── App.tsx              # Main app component
│   ├── .env                     # Environment variables
│   └── package.json
│
├── backend/                      # Backend API
│   ├── src/
│   │   ├── middleware/          # Auth middleware
│   │   ├── models/              # Database models
│   │   ├── routes/              # API routes
│   │   └── server.js            # Express server
│   ├── database/
│   │   └── migrations/          # SQL schema files
│   ├── .env.example             # Environment template
│   └── package.json
│
├── docs/
│   ├── DEPLOYMENT_GUIDE.md      # Step-by-step deployment
│   ├── COMPLETE_CONNECTION_GUIDE.md  # API + DB connection
│   └── HOW_TO_EDIT.md           # Non-coder editing guide
│
└── README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (or Supabase account)
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/iklearnedge.git
cd iklearnedge
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# For local development:
DATABASE_URL=postgresql://user:password@localhost:5432/iklearnedge
JWT_SECRET=your-secret-key-min-32-characters

# Run database migrations
psql -d iklearnedge -f database/migrations/001_initial_schema.sql

# Start development server
npm run dev
```

Backend will run on http://localhost:5000

### 3. Frontend Setup

```bash
cd app
npm install

# Create environment file
cp .env.example .env

# Edit .env
VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

Frontend will run on http://localhost:5173

### 4. Create Admin User

```bash
# Register via API
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@iklearnedge.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "admin"
  }'
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Complete deployment instructions |
| [COMPLETE_CONNECTION_GUIDE.md](COMPLETE_CONNECTION_GUIDE.md) | API and database connection details |
| [HOW_TO_EDIT.md](HOW_TO_EDIT.md) | Guide for non-coders to edit content |

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Subjects (Admin-controlled pricing)
- `GET /api/subjects` - Get all active subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject (Admin)
- `PUT /api/subjects/:id` - Update subject (Admin)
- `PUT /api/subjects/:id/pricing` - Update pricing (Admin)
- `DELETE /api/subjects/:id` - Delete subject (Admin)

### Teachers
- `GET /api/teachers` - Get all live teachers
- `GET /api/teachers/:id` - Get teacher profile
- `GET /api/teachers/profile` - Get my profile (Teacher)
- `PUT /api/teachers/profile` - Update profile (Teacher)
- `PUT /api/teachers/:id/verify` - Verify teacher (Admin)

### Students
- `GET /api/students/profile` - Get my profile (Student)
- `PUT /api/students/profile` - Update profile (Student)

### Bookings
- `GET /api/bookings` - Get my bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/status` - Update booking status

### Payments
- `GET /api/payments` - Get payments
- `GET /api/payments/pending` - Get pending payments (Admin)
- `POST /api/payments` - Upload payment proof
- `PUT /api/payments/:id/verify` - Verify payment (Admin)

### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/revenue` - Get revenue report

## 🎨 Customization

### Change Colors
Edit `app/src/index.css`:
```css
:root {
  --primary: #f5a623;    /* Change this */
  --secondary: #4a4a4a;  /* Change this */
}
```

### Add New Subjects
1. Login as Admin
2. Go to "Subjects & Pricing"
3. Click "Add Subject"
4. Set prices for each grade level

### Update Content
See [HOW_TO_EDIT.md](HOW_TO_EDIT.md) for detailed instructions.

## 💰 Pricing Model

The platform uses **admin-controlled pricing**:

1. Admin sets prices per subject + grade level
2. Teachers cannot set their own rates
3. Students see fixed prices based on their grade
4. Prices are consistent across all teachers for same subject/grade

Example pricing structure:
| Subject | Grade 1-5 | O-Level | A-Level |
|---------|-----------|---------|---------|
| Math    | $15/hr    | $25/hr  | $35/hr  |
| Physics | $18/hr    | $28/hr  | $38/hr  |

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- File upload validation
- CORS protection
- Role-based access control
- SQL injection prevention (parameterized queries)

## 📱 Screenshots

*Homepage, Teacher Dashboard, Student Dashboard, Admin Dashboard screenshots to be added*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use for your own tutoring platform!

## 🆘 Support

If you need help:
1. Check the documentation files
2. Review the code comments
3. Open an issue on GitHub

---

**Built with ❤️ for connecting teachers and students across borders**
