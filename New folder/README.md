# TaskFlow — Full Stack Task Manager

A MERN stack task management app built for a Full Stack Developer interview assignment.

## Features

- **Auth** — Register, Login, Logout (JWT)
- **Boards** — Create, Edit, Delete boards
- **Tasks** — Create, Edit, Delete tasks with Title, Description, Priority, Due Date, Estimated Effort
- **Kanban View** — Tasks grouped into To Do / In Progress / Done columns
- **Status Toggle** — Click a button on a task to cycle its status
- **AI Estimate** — "Suggest Estimate" button calls Google Gemini API for effort + due date suggestion
- **Dark Mode** — Fully dark UI with Tailwind CSS
- **Toast Notifications** — Success and error feedback
- **Loading Spinners** — Shown during data fetches
- **Empty States** — Friendly messages when no data exists
- **Confirm Before Delete** — Dialog shown before any destructive action

---
## Access site from the following
vercel app==  https://task-flow-ai-xa5m-6ndeghqv5-tassu67.vercel.app/login
render for backend== https://task-flow-ai-ivy0.onrender.com
## Available Demo Video in folder demo

## Tech Stack

| Layer     | Technology                       |
|-----------|----------------------------------|
| Frontend  | React, Vite, React Router, Tailwind CSS, Axios |
| Backend   | Node.js, Express                 |
| Database  | MongoDB + Mongoose               |
| Auth      | JWT + bcryptjs                   |
| AI        | Google Gemini 1.5 Flash API      |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── boardController.js
│   │   ├── taskController.js
│   │   └── aiController.js
│   ├── middleware/auth.js     # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Board.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── boards.js
│   │   ├── tasks.js
│   │   └── ai.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── context/AuthContext.jsx   # Global auth state
    │   ├── services/api.js           # Axios instance
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── BoardCard.jsx
    │   │   ├── TaskCard.jsx
    │   │   ├── ConfirmDialog.jsx
    │   │   └── Spinner.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── BoardDetail.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env.example
```

---

## Setup & Run Locally

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas connection string)
- Google Gemini API key (free at https://aistudio.google.com)

### 1. Clone the repo
```bash
git clone <your-repo-url>
cd taskflow
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create your .env file
cp .env.example .env
# Fill in your values in .env
```

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=pick_a_long_random_string
GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev
```
Backend runs on http://localhost:5000

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs on http://localhost:3000

---

## API Endpoints

### Auth
| Method | Route              | Description        |
|--------|--------------------|--------------------|
| POST   | /api/auth/register | Register user      |
| POST   | /api/auth/login    | Login user         |
| GET    | /api/auth/me       | Get current user   |

### Boards (protected)
| Method | Route            | Description      |
|--------|------------------|------------------|
| GET    | /api/boards      | Get all boards   |
| POST   | /api/boards      | Create a board   |
| PUT    | /api/boards/:id  | Update a board   |
| DELETE | /api/boards/:id  | Delete a board   |

### Tasks (protected)
| Method | Route                  | Description         |
|--------|------------------------|---------------------|
| GET    | /api/tasks?boardId=xxx | Get tasks for board |
| POST   | /api/tasks             | Create a task       |
| PUT    | /api/tasks/:id         | Update a task       |
| DELETE | /api/tasks/:id         | Delete a task       |
| PATCH  | /api/tasks/:id/status  | Update task status  |

### AI
| Method | Route                    | Description            |
|--------|--------------------------|------------------------|
| POST   | /api/ai/suggest-estimate | Get AI effort estimate |

---

## MongoDB Schemas

### User
```
name, email, password (hashed), timestamps
```

### Board
```
title, description, user (ref), timestamps
```

### Task
```
title, description, priority (low/medium/high),
status (todo/in-progress/done), dueDate, estimatedEffort,
board (ref), user (ref), timestamps
```

---

## Deployment

### Backend — Render.com (free tier)
1. Push code to GitHub
2. Go to https://render.com → New Web Service
3. Connect your repo, set root directory to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables (PORT, MONGO_URI, JWT_SECRET, GEMINI_API_KEY)

### Frontend — Vercel (free)
1. Go to https://vercel.com → New Project
2. Connect your repo, set root directory to `frontend`
3. Framework preset: Vite
4. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
5. In `frontend/src/services/api.js`, update baseURL to `process.env.VITE_API_URL + "/api"` for production

### Database — MongoDB Atlas (free)
1. Create a free cluster at https://cloud.mongodb.com
2. Get your connection string and replace `MONGO_URI` in your backend env

---

## Interview Tips

- **JWT flow**: token is stored in `localStorage`, sent as `Authorization: Bearer <token>` header
- **Auth middleware** in `backend/middleware/auth.js` verifies the token on every protected route
- **Context API** in `frontend/src/context/AuthContext.jsx` shares user state across all components
- **Axios instance** in `frontend/src/services/api.js` sets the base URL so you never repeat it
- **AI fallback**: if Gemini fails, the backend returns a default estimate — the frontend shows a warning
