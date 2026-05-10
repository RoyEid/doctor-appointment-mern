# MediCare - MERN Doctor Appointment System

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://doctor-appointment-mern-nu.vercel.app)
[![React](https://img.shields.io/badge/React-19.1-blue.svg?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg?logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248.svg?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)

MediCare is a premium, full-stack healthcare platform designed to streamline medical appointment scheduling. Built with the **MERN stack**, it features a multi-role architecture (Patient, Doctor, Admin) and sophisticated appointment management logic, ensuring a seamless experience for both healthcare providers and patients.

---

## 🔗 Live Links

- **Frontend (Vercel):** [https://doctor-appointment-mern-nu.vercel.app](https://doctor-appointment-mern-nu.vercel.app)
- **Backend API (Render):** [https://doctor-backend-46g2.onrender.com](https://doctor-backend-46g2.onrender.com)

---

## 🔑 Demo Accounts

Experience the platform from different perspectives using these demo credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `royeid984+admin@gmail.com` | `Admin123` |
| **Doctor** | `royeid984+michael.brown@gmail.com` | `MichaelBrown123` |
| **Patient** | `royeid984+patient.karim@gmail.com` | `PatientDemo123` |

---

## ✨ Key Features

### 👤 Patient Features
- **Smart Booking:** Browse doctors by specialty and book available 30-minute time slots.
- **Appointment Tracking:** Real-time status updates (Pending, Approved, Rejected, Completed).
- **Reschedule Requests:** Propose new times if a scheduled appointment no longer works.
- **Account Security:** Email verification, secure login, and password reset via email.
- **Personal Dashboard:** Manage personal history and upcoming consultations.

### 🩺 Doctor Features
- **Professional Dashboard:** Overview of daily schedule and patient requests.
- **Appointment Control:** Approve or reject requests and suggest alternative times (Reschedule Flow).
- **Profile Management:** Update professional details and profile images via ImageKit.
- **Automated Workflow:** Past appointments are automatically marked as "Completed" by system background jobs.

### 🛡️ Admin Features
- **Advanced Analytics:** Data visualization using **Recharts** (Booking trends, status distribution, top doctors).
- **Resource Management:** Full CRUD operations for medical Departments and Doctors.
- **Global Oversight:** Monitor all appointments across the platform.

### 🚀 Technical Features
- **Role-Based Access Control (RBAC):** Strict front-to-back security for Patients, Doctors, and Admins.
- **Automated Jobs:** Background services for appointment reminders and status updates.
- **Modern UI:** Responsive design with **Dark/Light Mode** support and glassmorphism aesthetics.
- **Secure Storage:** Cloud-based image management using **ImageKit**.

---

## 💻 Tech Stack

**Frontend:**
- React 19 (Hooks, Context API)
- Tailwind CSS (Premium Dark Mode UI)
- Lucide React (Icons)
- Recharts (Analytics & Charts)
- React Router 7 (Routing)
- Axios & React Toastify

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose (ODM)
- JWT (Authentication)
- Bcryptjs (Password Hashing)
- Multer & ImageKit (Image Management)
- Brevo (Transactional Email Service)

**Deployment:**
- Vercel (Frontend)
- Render (Backend)
- MongoDB Atlas (Database)

---


## 📂 Project Architecture

```text
doctor-appointment-mern/
├── backend/ (Root)
│   ├── auth/           # JWT & RBAC Middleware
│   ├── config/         # DB Connection & Cloud Config
│   ├── models/         # Mongoose Schemas (User, Doctor, Appt, Dept)
│   ├── routes/         # API Endpoint Handlers
│   ├── utils/          # Background Jobs & Email Templates
│   └── server.js       # Entry Point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── context/    # Auth & Theme State
│   │   ├── pages/      # View Components
│   │   ├── config/     # API Configuration
│   │   └── App.js      # Routing & Layout
```

---

## 🛠️ Installation & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/RoyEid/doctor-appointment-mern.git
cd doctor-appointment-mern
```

### 2. Backend Setup
1. Create a `.env` file in the root directory:
```env
MONGO_URI=your_mongodb_atlas_uri
SECRET_KEY=your_jwt_secret
PORT=10000
IMAGEKIT_URL_ENDPOINT=your_imagekit_endpoint
IMAGEKIT_PUBLIC_KEY=your_imagekit_public
IMAGEKIT_PRIVATE_KEY=your_imagekit_private
BREVO_API_KEY=your_brevo_api_key
GOOGLE_CLIENT_ID=your_google_id (optional)
```
2. Install dependencies & start:
```bash
npm install
npm run dev
```

### 3. Frontend Setup
1. Navigate to the frontend folder:
```bash
cd frontend
```
2. Create a `.env` file:
```env
REACT_APP_API_URL=http://localhost:10000
```
3. Install dependencies & start:
```bash
npm install
npm start
```

---

## 🔌 API Overview

### Authentication
- `POST /auth/register` - New user registration
- `POST /auth/signin` - Secure login
- `POST /auth/forgot-password` - Password reset request

### Appointments
- `POST /appointments/createAppointment` - Patient booking
- `GET /appointments/doctor/schedule` - Fetch available slots
- `PUT /appointments/:id/status` - Approve/Reject/Reschedule

### Admin
- `GET /appointments/admin/analytics` - Fetch platform metrics
- `POST /doctors/addDoctors` - Add new medical professional

---

## 💡 What I Learned

Building this project provided deep insights into:
- **Complex Logic:** Implementing an appointment rescheduling flow that requires two-way confirmation.
- **Security Best Practices:** Managing secure image uploads and implementing granular RBAC.
- **State Management:** Syncing authentication states across roles and managing persistent theme settings.
- **Production Deployment:** Configuring CI/CD and managing environment-specific configurations.

---

## 👨‍💻 Author

**Roy Eid**  
Full Stack Developer  
- **GitHub:** [RoyEid](https://github.com/RoyEid)  
- **LinkedIn:** [Roy Eid](https://www.linkedin.com/in/royeid02/)  
- **Email:** roy.eid02@gmail.com

---
*Developed with ❤️ as a portfolio project.*
