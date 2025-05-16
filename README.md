# Mediterranean Alumni Platform

A full-stack web application for managing alumni relationships, events, photo albums, and more for Mediterranean College.

## 📋 Project Overview

The Mediterranean Alumni Platform is designed to connect former students, organize events, share memories through photo albums, and maintain an active alumni community. The application supports different user roles (administrators, registered alumni, and visitors) with appropriate access control.

## ✨ Features

- **User Authentication**
  - Registration and login system
  - Role-based access control
  - JWT authentication

- **Profile Management**
  - Create and edit alumni profiles
  - Group profiles by school or program
  - Search and filter alumni directory

- **Event Management**
  - Create, edit, and delete events
  - Register for events
  - View upcoming and past events
  - Filter events by category and date

- **Photo Gallery**
  - Create and manage photo albums
  - Upload and organize photos
  - View photos in grid or carousel format

- **Administration Dashboard**
  - Approve registration applications
  - Manage schools and programs
  - System statistics and monitoring
  - Content management tools

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Secure authentication
- **Multer** - File upload handling

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Context API** - State management
- **Axios** - HTTP client
- **CSS** - Custom styling without external UI libraries

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mediterranean-alumni.git
cd mediterranean-alumni
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

4. Create a `.env` file in the root directory with the following variables (or run the app once to auto-generate it):
```
NODE_ENV=development
PORT=5006
MONGO_URI=mongodb://localhost:27017/mediterranean-alumni
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
```

5. Initialize the database with sample data (optional):
```bash
node scripts/initDb.js
```

### Running the Application

To run both the backend and frontend concurrently:
```bash
npm run dev
```

The application will run on:
- Frontend: http://localhost:3001
- Backend: http://localhost:5006

To run only the backend:
```bash
npm run server
```

To run only the frontend:
```bash
npm run client
```

## 📁 Project Structure

```
mediterranean-alumni/
├── client/                 # React frontend
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # React components
│       │   ├── admin/      # Admin dashboard components
│       │   ├── auth/       # Authentication components
│       │   ├── dashboard/  # User dashboard components
│       │   ├── events/     # Event-related components
│       │   ├── gallery/    # Photo gallery components
│       │   ├── layout/     # Shared layout components
│       │   └── profiles/   # Profile-related components
│       ├── context/        # React Context API
│       └── utils/          # Utility functions
├── config/                 # Backend configuration
├── middleware/             # Express middleware
├── mock/                   # Mock data (for database fallback)
│   ├── eventData.js        # Mock events data
│   └── albumData.js        # Mock albums data
├── models/                 # Mongoose data models
├── routes/                 # API routes
│   └── api/                # API endpoints
├── scripts/                # Utility scripts
├── uploads/                # File upload directory
├── .env                    # Environment variables
├── server.js               # Express server entry point
└── package.json            # Project dependencies
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/user` - Get authenticated user

### Profiles
- `GET /api/profiles` - Get all profiles
- `GET /api/profiles/:id` - Get profile by ID
- `POST /api/profiles` - Create new profile
- `PUT /api/profiles/:id` - Update profile

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/register` - Register for event

### Albums
- `GET /api/albums` - Get all albums
- `GET /api/albums/:id` - Get album by ID
- `POST /api/albums` - Create new album
- `PUT /api/albums/:id` - Update album
- `DELETE /api/albums/:id` - Delete album
- `POST /api/albums/:id/photos` - Add photo to album
- `DELETE /api/albums/:id/photos/:photoId` - Delete photo from album

## 🚩 Notable Features

### Fallback to Mock Data
The application is designed to function even without a database connection. If MongoDB isn't available:
- Mock data is used as a fallback
- All CRUD operations work with in-memory data
- The UI functions normally with the mock data

### Responsive Design
The UI is fully responsive and works on desktop and mobile devices.

## 📝 License

MIT License

## 📧 Contact

For questions or support, please contact the Mediterranean College Alumni Office. 