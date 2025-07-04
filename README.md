# Parlour Admin Dashboard

A full-stack Parlour Admin Dashboard system with real-time attendance tracking, employee management, and task management.

## Features

- **Authentication**: JWT-based login with role-based access control
- **User Roles**: 
  - Super Admin: Full CRUD access to employees, tasks, and attendance
  - Admin: View-only access to all data
- **Real-time Attendance**: Live punch-in/out system with WebSocket updates
- **Employee Management**: Add, edit, delete employees (Super Admin only)
- **Task Management**: Assign and track tasks (Super Admin only)
- **Live Dashboard**: Real-time attendance logs and updates

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- ShadCN UI Components
- Socket.IO Client

### Backend
- Node.js
- TypeScript
- Express.js (MVC architecture)
- MongoDB with Mongoose
- Socket.IO (WebSocket)
- JWT Authentication

## Project Structure

```
parlour_panel/
├── frontend-parlour-dashboard/     # Next.js frontend
│   ├── app/                       # App Router pages
│   ├── components/                # UI components
│   ├── hooks/                     # Custom hooks
│   ├── lib/                       # Utility functions
│   └── providers/                 # Context providers
└── backend-parlour-api/           # Node.js backend
    ├── src/
    │   ├── config/                # Database configuration
    │   ├── middleware/            # Authentication middleware
    │   ├── models/                # MongoDB models
    │   ├── routes/                # API routes
    │   └── scripts/               # Database seeding
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)
- npm or pnpm

### 1. Clone the Repository
```bash
git clone <repository-url>
cd parlour_panel
```

### 2. Backend Setup
```bash
cd backend-parlour-api

# Install dependencies
npm install

# Create .env file
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/parlour_dashboard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000" > .env

# Seed the database with initial data
npm run seed

# Start the development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend-parlour-dashboard

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Start the development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Login Credentials

After running the seed script, you can login with:

**Super Admin:**
- Email: `superadmin@parlour.com`
- Password: `password123`

**Admin:**
- Email: `admin@parlour.com`
- Password: `password123`

## Pages & Features

### `/login`
- Email/password authentication
- JWT token storage
- Role-based redirects

### `/dashboard`
- **Employees Section**: 
  - Super Admin: Add, edit, delete employees
  - Admin: View-only access
- **Tasks Section**:
  - Super Admin: Assign, update, delete tasks
  - Admin: View-only access
- **Live Attendance**: Real-time punch-in/out logs

### `/attendance`
- Public front desk page
- List all employees with punch buttons
- Real-time updates via WebSocket

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees (public)
- `POST /api/employees` - Create employee (Super Admin)
- `PUT /api/employees/:id` - Update employee (Super Admin)
- `DELETE /api/employees/:id` - Delete employee (Super Admin)

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task (Super Admin)
- `PUT /api/tasks/:id` - Update task (Super Admin)
- `DELETE /api/tasks/:id` - Delete task (Super Admin)

### Attendance
- `POST /api/attendance/punch` - Punch in/out (public)
- `GET /api/attendance/logs` - Get attendance logs

## Real-time Features

The application uses Socket.IO for real-time updates:
- Live attendance updates across all dashboards
- Real-time punch-in/out notifications
- Automatic UI updates without page refresh

## Development

### Backend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run seed         # Seed database
```

### Frontend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/parlour_dashboard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Production Deployment

1. Set up MongoDB (Atlas or self-hosted)
2. Configure environment variables
3. Build both frontend and backend
4. Deploy to your preferred hosting platform

## License

MIT License
