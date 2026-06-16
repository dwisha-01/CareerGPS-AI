# CareerGPS AI 🚀

CareerGPS AI is an AI-powered career guidance platform that helps users analyze their career goals, generate personalized learning roadmaps, review resumes, and track their progress through an interactive dashboard.

## Features

### AI Career Roadmap Generator

* Generate personalized learning roadmaps based on target roles.
* AI-driven recommendations tailored to user profiles and skills.

### AI Resume Analysis

* Upload PDF resumes for automated analysis.
* Receive actionable feedback and improvement suggestions.
* Target company-specific resume evaluation.

### AI Resume Bullet Editor

* Transform resume bullet points using the XYZ formula.
* Generate stronger, impact-focused descriptions.

### Profile & Skills Management

* Create and update career profiles.
* Add and manage skills and interests through an interactive tag system.

### Progress Tracking

* Interactive roadmap checklist.
* Progress persistence using MongoDB.
* Assessment history and roadmap tracking.

### Secure Authentication

* User registration and login.
* JWT-based authentication.
* Password hashing with bcrypt.
* Protected API routes using middleware.

## Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Framer Motion

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### AI & Integrations

* Google Gemini API
* PDF Parsing (pdf-parse)
* File Uploads (Multer)

### Security

* JWT Authentication
* bcrypt Password Hashing
* Protected Routes Middleware

## Project Architecture

Frontend (React)
↓
Express API
↓
Authentication Layer (JWT + Middleware)
↓
MongoDB Database
↓
Gemini AI Integration

## Learning Outcomes

Building CareerGPS AI helped me gain hands-on experience with:

* Full-stack MERN application development
* JWT authentication and middleware workflows
* Password hashing and backend security practices
* REST API design and integration
* File uploads and PDF processing
* AI integration using Google's Gemini API
* State management and dashboard-based UI development

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd CareerGPS-AI
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Run backend:

```bash
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Future Improvements

* Company-specific interview preparation
* AI-powered project recommendations
* Skill gap analysis
* Resume scoring system
* Career trend insights

## Author

Dwisha Gada
