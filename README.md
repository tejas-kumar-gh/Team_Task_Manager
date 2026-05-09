# Team Task Manager

A production-ready full-stack web application designed for teams to manage projects, assign tasks, track progress, and collaborate seamlessly. It is built with the MERN stack (MongoDB, Express, React, Node.js) and features a modern, premium Glassmorphic UI with Tailwind CSS v4.

## 🌟 Features

### Role-Based Access Control (RBAC)

The application implements secure Role-Based Access Control using JWT authentication and protected backend middleware.

#### Admin Permissions
Admins have full access to the platform and can:
- Create, edit, and delete projects
- Add or remove team members
- Create and assign tasks
- View all tasks and project analytics
- Access admin-only routes and dashboard features

#### Member Permissions
Members have limited access and can:
- View assigned projects
- View assigned tasks
- Update task status
- Access personal dashboard statistics

#### Security Implementation
- JWT stored in HTTP-only cookies
- Protected API routes using authentication middleware
- Role verification middleware for admin-only actions
- Unauthorized users cannot access restricted resources
- Persistent login session support

### Core Functionality
- **Projects Management**: Organize work into separate projects.
- **Task Management**: Tasks contain priority (Low, Medium, High), status (Todo, In Progress, Completed), due dates, and assignments.
- **Dashboard**: High-level statistical overview (Total Projects, Total Tasks, Completed, Pending, Overdue) with progress visualization.
- **Dark/Light Mode**: Full theme switching support.
- **Premium UI**: Glassmorphism design elements and responsive layouts.

## 💻 Tech Stack

**Frontend:**
- React.js with Vite
- Tailwind CSS v4 (using `@tailwindcss/vite`)
- React Router DOM
- Axios
- Lucide React (Icons)
- date-fns (Date formatting)

**Backend:**
- Node.js & Express.js
- MongoDB Atlas & Mongoose
- JSON Web Tokens (JWT)
- Cookie-parser
- bcryptjs

## 📁 Folder Structure

```txt
newPro/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── api/            # Axios API Configuration
│   │   ├── components/     # Reusable Components (Layout, ProtectedRoute)
│   │   ├── context/        # Auth Context
│   │   ├── pages/          # Application Pages (Login, Dashboard, Tasks, etc.)
│   │   ├── App.jsx         # App Router Configuration
│   │   ├── main.jsx        # App Entry Point
│   │   └── index.css       # Tailwind v4 configuration and Glassmorphic CSS variables
│   ├── .env                # Frontend Environment Variables
│   └── vite.config.js      # Vite Configuration
│
└── server/                 # Backend Node.js Application
    ├── config/             # Database Connection Configuration
    ├── controllers/        # Route Handlers / Logic
    ├── middleware/         # Auth & Error Middleware
    ├── models/             # Mongoose Schemas
    ├── routes/             # API Endpoints
    ├── utils/              # Helper functions (JWT Generator)
    ├── .env                # Backend Environment Variables
    └── index.js            # Express Server Entry Point
```

## 🚀 Installation & Local Setup

### 1. Clone the repository and install dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the development servers

```bash
# In the server directory:
npm run dev

# In the client directory:
npm run dev
```

The application will be running at `http://localhost:5173`.

## 🚂 Railway Deployment Steps

This application is configured and ready for Railway deployment out of the box.

### Database (MongoDB Atlas)
Ensure your MongoDB Atlas cluster allows connections from anywhere (`0.0.0.0/0`) since Railway IPs are dynamic.

### Backend Deployment (Railway)
1. Create a new project in Railway.
2. Select **Deploy from GitHub repo** and choose your repository.
3. Once imported, go to the Backend service **Settings**.
4. Set the Root Directory to `/server` if it is a monorepo.
5. In the **Variables** tab, add the following variables:
   - `NODE_ENV=production`
   - `MONGO_URI=your_production_mongodb_url`
   - `JWT_SECRET=your_secure_secret`
   - `FRONTEND_URL=https://your-frontend-url.up.railway.app`
6. Railway will automatically inject `PORT` and run `npm start` (which runs `node index.js`).

### Frontend Deployment (Railway or Vercel)
1. Create a new service in Railway / Vercel.
2. Connect to the repository.
3. Set the Root Directory to `/client`.
4. In the **Variables** tab, add:
   - `VITE_API_URL=https://your-backend-url.up.railway.app/api`
5. The build command is `npm run build` and output directory is `dist`.
6. Railway/Vercel will build and serve the static files.

## 🔗 API Routes

| HTTP Method | Route | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user | Public |
| `POST` | `/api/auth/login` | Authenticate user & get token | Public |
| `POST` | `/api/auth/logout` | Logout user | Private |
| `GET` | `/api/auth/profile` | Get user profile | Private |
| `GET` | `/api/auth/users` | Get all users | Private/Admin |
| `GET` | `/api/projects` | Get all projects | Private |
| `POST` | `/api/projects` | Create a project | Private/Admin |
| `DELETE`| `/api/projects/:id` | Delete project | Private/Admin |
| `GET` | `/api/tasks` | Get all tasks | Private |
| `POST` | `/api/tasks` | Create a task | Private/Admin |
| `PUT` | `/api/tasks/:id` | Update a task | Private |
| `GET` | `/api/tasks/dashboard`| Get dashboard statistics | Private |

## Screenshots

*(Add screenshots of your Dashboard, Dark Mode, Tasks Kanban-style list, and Login page here once deployed!)*
