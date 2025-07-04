# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB running (local or cloud)
- Git

## Quick Start

1. **Clone and navigate to the project**
```bash
git clone <your-repo-url>
cd parlour_panel
```

2. **Set up Backend**
```bash
cd backend-parlour-api
npm install

# Create .env file
echo "PORT=5000
MONGODB_URI=mongodb://localhost:27017/parlour_dashboard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:3000" > .env

# Seed database
npm run seed

# Start backend (in background)
npm run dev &
```

3. **Set up Frontend**
```bash
cd ../frontend-parlour-dashboard
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Start frontend
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:3000
- Login with:
  - Super Admin: `superadmin@parlour.com` / `password123`
  - Admin: `admin@parlour.com` / `password123`

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env` file
- For cloud MongoDB, use the full connection string

### Port Already in Use
- Backend: Change `PORT` in `.env` file
- Frontend: Use `npm run dev -- -p 3001`

### Module Not Found Errors
- Run `npm install` in both directories
- Clear node_modules and reinstall if needed

## Features to Test

1. **Login**: Try both Super Admin and Admin accounts
2. **Dashboard**: 
   - Super Admin can add/edit/delete employees and tasks
   - Admin can only view data
3. **Attendance**: Visit `/attendance` to test punch in/out
4. **Real-time**: Open multiple tabs to see live updates 