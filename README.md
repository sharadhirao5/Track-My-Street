# Track My Street
### AI-Powered Road Damage Monitoring and Pothole Detection System

## Overview
Track My Street is a web-based application that helps citizens report damaged roads and potholes. It uses AI-based image detection and complaint management to support road damage reporting and administrative monitoring.

## Features
- **User Authentication:** Citizen registration and login with role-based access.
- **AI Road Damage Detection:** Analyze uploaded road images using a YOLO-based model.
- **Complaint Submission:** Submit road damage images, descriptions, and GPS coordinates.
- **My Complaints:** View submitted complaints and track their status.
- **Admin Dashboard:** View, filter, and manage complaints.
- **Admin Map:** View reported road damage locations on an interactive map.
- **Notifications:** Receive complaint submission and status update notifications.
- **Duplicate Detection:** Identify possible duplicate complaints near existing reports.

## Technology Stack
- **Frontend:** React.js, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **AI Service:** Python, Flask, YOLO
- **Maps:** Leaflet, React Leaflet
- **Authentication:** JWT, bcryptjs
- **Version Control:** Git and GitHub

## Project Structure
```text
Track-My-Street/
├── frontend/
├── backend/
└── ai-model/
```

- `frontend/` — React user interface
- `backend/` — REST APIs, authentication, complaint management, and database integration
- `ai-model/` — AI road damage detection service and model

## Prerequisites
- Node.js and npm
- Python 3
- MongoDB
- Git

## Installation and Setup

### 1. Clone the repository
```bash
git clone https://github.com/sharadhirao5/Track-My-Street.git
cd Track-My-Street
```

### 2. Start the backend
```bash
cd backend
npm install
npm run dev
```

Configure the required environment variables in `backend/.env` before starting the backend. Refer to `backend/package.json` for the available scripts.

### 3. Start the AI service
Open a separate terminal and enter the AI service directory:
```bash
cd ai-model
```

Install the dependencies specified by the AI service's requirements file, if provided, and start the Flask application using its configured entry point. Ensure the service uses the port configured for the backend integration.

### 4. Start the frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Running the Application
1. Start MongoDB.
2. Start the Node.js backend.
3. Start the Python AI service.
4. Start the React frontend.
5. Log in as a citizen to submit complaints and track updates.
6. Log in as an authorized administrator to manage complaints and view their locations.

## Security
- Do not commit `.env` files or secret keys.
- Keep protected API routes behind authentication.
- Restrict citizen complaint access to the complaint owner.
- Require administrator authorization for administrative operations.

## Repository
[Track My Street on GitHub](https://github.com/sharadhirao5/Track-My-Street)