# WorkSphere

WorkSphere is a full-stack project and task management application built using the MERN stack.

It provides authentication, workspace and member management, project and task management, task comments, activity tracking, a dashboard, and user settings.

---

## 🚀 Features

### 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Password hashing using bcrypt
- Protected API routes
- User profile retrieval
- Authentication middleware

### 🏢 Workspace Management

- Create workspaces
- View workspaces
- View workspace details
- Update workspaces
- Delete workspaces
- Workspace ownership
- Add workspace members
- Remove workspace members
- Update member roles
- Member and manager roles

### 📁 Project Management

Projects are organized inside workspaces.

- Create projects
- View workspace projects
- View project details
- Update projects
- Delete projects
- Project description
- Project status
- Project start date
- Project due date

Supported project statuses:

- Active
- Completed
- Archived

### ✅ Task Management

Tasks are created inside projects and can be assigned to workspace members.

- Create tasks
- View project tasks
- View task details
- Edit tasks
- Delete tasks
- Assign tasks to workspace members
- Update task status
- Update task priority
- Set task due date
- Add task descriptions
- Track task creator

Supported task statuses:

- Todo
- In Progress
- Completed

Supported task priorities:

- Low
- Medium
- High
- Urgent

### 💬 Task Comments

Tasks include a comment system for collaboration.

- Add comments
- View comments
- Edit comments
- Delete comments
- Display comment author
- Display comment timestamp
- Only comment owners can edit their comments
- Only comment owners can delete their comments

### 📈 Activity Tracking

WorkSphere includes an activity tracking system for recording important actions performed within the application.

Activities are associated with relevant users and workspaces.

### 📊 Dashboard

The dashboard provides an overview of the user's work.

It displays:

- Total workspaces
- Total projects
- Total tasks
- Completed tasks
- Task completion percentage
- Todo task count
- In-progress task count
- Completed task count
- Recent projects
- Recent tasks

The dashboard also provides navigation to relevant projects and tasks.

### ⚙️ Settings

The Settings page provides:

- User profile information
- User name
- User email
- User role
- Security section
- Logout functionality

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router
- Axios
- Lucide React
- Sonner

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Zod
- CORS
- Cookie Parser
- Nodemon

### Database

- MongoDB Atlas

---

## 🏗️ Architecture

WorkSphere uses a separate frontend and backend architecture.

```text
WorkSphere
│
├── Frontend
│   └── React + Vite
│
├── Backend
│   └── Node.js + Express
│
└── MongoDB Atlas
```

The frontend communicates with the backend through REST APIs.

```text
React Frontend
      │
      │ Axios
      ▼
Express REST API
      │
      │ Mongoose
      ▼
MongoDB Atlas
```

---

## 📂 Project Structure

```text
WorkSphere/
│
├── Frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── routes/
│       ├── redux/
│       ├── App.jsx
│       └── main.jsx
│
├── Backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── validators/
│       ├── utils/
│       ├── app.js
│       └── server.js
│
├── .gitignore
└── README.md
```

### Frontend

The frontend contains:

- React pages
- Reusable UI components
- API service functions
- Redux state management
- Application routes
- Task and comment components

### Backend

The backend contains:

- REST API routes
- Controllers
- MongoDB models
- Authentication middleware
- Authorization middleware
- Request validation
- Error handling
- Utility functions

---

## 🔑 Authentication Flow

WorkSphere uses JWT-based authentication.

```text
User
 │
 ├── Register
 │      ↓
 │   Password hashed with bcrypt
 │      ↓
 │   User stored in MongoDB
 │
 └── Login
        ↓
   Credentials verified
        ↓
   JWT generated
        ↓
   Token stored on frontend
        ↓
   Axios attaches JWT
        ↓
   Protected API request
        ↓
   Authentication middleware
        ↓
   Request processed
```

Authenticated requests use:

```text
Authorization: Bearer <token>
```

---

## 🔄 REST API

Development API base URL:

```text
http://localhost:3000/api
```

### Authentication

```text
POST   /auth/register
POST   /auth/login
GET    /auth/profile
```

### Workspaces

```text
GET    /workspaces
POST   /workspaces

GET    /workspaces/:workspaceId
PATCH  /workspaces/:workspaceId
DELETE /workspaces/:workspaceId
```

### Workspace Members

```text
GET    /workspaces/:workspaceId/members
POST   /workspaces/:workspaceId/members

PATCH  /workspaces/:workspaceId/members/:userId
DELETE /workspaces/:workspaceId/members/:userId
```

### Projects

```text
GET    /workspaces/:workspaceId/projects
POST   /workspaces/:workspaceId/projects

GET    /projects/:projectId
PATCH  /projects/:projectId
DELETE /projects/:projectId
```

### Tasks

```text
GET    /projects/:projectId/tasks
POST   /projects/:projectId/tasks

GET    /tasks/:taskId
PATCH  /tasks/:taskId
DELETE /tasks/:taskId
```

### Comments

```text
GET    /tasks/:taskId/comments
POST   /tasks/:taskId/comments

PATCH  /comments/:commentId
DELETE /comments/:commentId
```

---

## 🧩 Data Models

The application currently uses the following MongoDB models:

```text
User
Workspace
Project
Task
Comment
Activity
```

Relationships:

```text
User
 │
 ├── Workspace Membership
 │
 ├── Activity
 │
 └── Comments
        │
        ▼
Workspace
 │
 └── Projects
       │
       └── Tasks
             │
             └── Comments
```

---

## 🛡️ Validation and Error Handling

The backend uses Zod for request validation.

Validation is implemented for:

- Authentication
- Workspaces
- Workspace members
- Projects
- Tasks
- Comments

The backend also includes:

- Custom `AppError`
- Async request handling
- Centralized error middleware
- Consistent error responses

---

## 🔒 Authorization

Protected resources are checked using authentication and workspace membership.

The application validates:

- Authenticated users
- Workspace ownership
- Workspace membership
- Workspace member roles
- Project access
- Task access
- Task assignment
- Comment ownership

Task assignment also verifies that the assigned user belongs to the corresponding workspace.

---

## 🎨 UI and UX

The frontend follows a modern SaaS-style interface.

### Design

- Blue-based theme
- Clean light backgrounds
- Rounded cards
- Subtle shadows
- Responsive layouts
- Consistent spacing
- Modern typography
- Reusable components

### User Experience

- Loading states
- Empty states
- Error states
- Toast notifications
- Confirmation dialogs
- Responsive task menus
- Modal-based task creation
- Modal-based task editing
- Task details pages
- Dashboard overview

---

## 📱 Application Pages

The current application includes:

```text
/login
/register
/dashboard
/workspaces
/workspaces/:workspaceId
/projects/:projectId
/tasks/:taskId
/settings
```

---

## 🔄 Application Workflow

```text
Register / Login
       ↓
Dashboard
       ↓
Create Workspace
       ↓
Add Team Members
       ↓
Create Project
       ↓
Create Tasks
       ↓
Assign Tasks
       ↓
Manage Task Status & Priority
       ↓
Open Task Details
       ↓
Add / Edit / Delete Comments
       ↓
Track Activity
```

---

## 🧠 Concepts Demonstrated

This project demonstrates practical full-stack development concepts including:

- MERN stack development
- REST API architecture
- JWT authentication
- Password hashing
- Express middleware
- Role-based authorization
- Request validation
- Centralized error handling
- MongoDB relationships
- Mongoose population
- CRUD operations
- Protected API routes
- Axios interceptors
- Redux state management
- React Router
- React component architecture
- Reusable modals
- API integration
- Loading and error handling
- Responsive UI development
- SaaS dashboard architecture

---

## ⚙️ Local Setup

### Prerequisites

Make sure you have:

- Node.js
- npm
- Git
- MongoDB Atlas account

### Clone Repository

```bash
git clone https://github.com/Nitin-yadav2804/WorkSphere.git
cd WorkSphere
```

### Backend Setup

```bash
cd Backend
npm install
npm start
```

Backend runs on:

```text
http://localhost:3000
```

### Environment Variables

Create:

```text
Backend/.env
```

Add:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Do not commit `.env` files to the repository.

### Frontend Setup

Open another terminal:

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 🗄️ Database

WorkSphere uses MongoDB Atlas with Mongoose.

```text
React
  ↓
Express
  ↓
Mongoose
  ↓
MongoDB Atlas
```

---

## 👨‍💻 Author

**Nitin Yadav**

GitHub:

https://github.com/Nitin-yadav2804/WorkSphere
