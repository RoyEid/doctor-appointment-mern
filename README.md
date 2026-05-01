# 🩺 Doctor Appointment MERN App — Production Architecture

A full-stack MERN application for booking doctor appointments with a production-ready, role-based architecture, strict authorization, and a clean service-oriented frontend.

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://doctor-appointment-mern-nnsd5n9l4-royeids-projects.vercel.app)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## ✅ Role System

Single authentication system with one User model:
- Roles: user, doctor, admin
- User: { name, email, password (hashed), role, specialization?, experience? }

Doctor-specific extended data remains in a Doctor profile document linked by userId (for image, description, availability).

---

## 🔐 Authorization Logic

- Users can manage only their own bookings (create/list/cancel).
- Doctors can only view and manage (approve/reject/reschedule) appointments assigned to them.
- Admins manage system data (doctors, departments, high-level stats).

Ownership checks:
- Doctor actions require appointment.doctorId === req.user.id.
- User delete endpoint sets status=cancelled (soft cancel) unless admin hard-deletes.

---

## 🗂 API Endpoints

Auth:
- POST /api/auth/register
- POST /api/auth/login
(Legacy still supported: /user/register, /user/signin)

Admin:
- POST /api/admin/create-doctor
- GET /api/admin/doctors
- DELETE /api/admin/doctors/:id
(Legacy doctor management endpoints preserved)

Doctor:
- GET /api/doctor/appointments
- PUT /api/doctor/appointments/:id/approve
- PUT /api/doctor/appointments/:id/reject
- PUT /api/doctor/update-profile

User/Appointments:
- POST /api/appointments
- GET /api/appointments/my
- DELETE /api/appointments/:id
(Legacy supported: /appointments/createAppointment, /appointments/myAppointments, /appointments/deleteAppointment/:id)

Note: If your server mounts routes under different base paths, the service layer includes fallbacks to legacy endpoints.

---

## 🧱 Models

User:
- name, email, password (bcrypt hashed), role ("user" | "doctor" | "admin")
- optional: specialization, experience

Doctor (profile):
- name, specialty, image, description, experienceYears, userId, availableSlots: string[]

Appointment:
- user (User._id), doctorId (User._id with role=doctor), doctor (Doctor._id profile, for population), date, time, reason, status: "pending" | "approved" | "rejected" | "cancelled" | "completed"

---

## 🛡 Security

- JWT Authentication with robust middleware.
- Role helpers: isAdmin, isDoctor, isUser (wrapping the core auth).
- Strict authorization + ownership checks for doctor/user actions.
- Input validation on critical routes.
- Passwords hashed with bcrypt.

---

## 🧩 Frontend Service Layer

Added Axios services to avoid duplicate calls in components:
- src/services/api.js: axios instance with token interceptor and baseURL from REACT_APP_API_URL
- src/services/authService.js: register/login/logout/getCurrentUser
- src/services/appointmentService.js: book/getMy/cancel/doctorApprove/doctorReject/doctorAppointments

---

## 🕒 Time Slots

- Doctors define availability (availableSlots) in profile.
- Users can only book available slots; double-booking is prevented at runtime.
- Rescheduling reverts status to pending unless explicitly approved.

---

## 🔧 Config

Environment variables (.env):
- MONGO_URI
- JWT_SECRET
- PORT
- REACT_APP_API_URL (frontend)

---

## 📝 Notes

- Legacy routes are preserved to avoid breaking existing clients.
- New REST endpoints are available and documented above.
- Ensure server mounts admin/doctor/appointments routers under /api/* to match the documented paths (or use the provided service layer fallbacks).

---

## 🌐 Deployment

🔗 Frontend (Live Demo):  
https://doctor-appointment-mern-nnsd5n9l4-royeids-projects.vercel.app  

🔗 Backend API:  
https://doctor-backend-46g2.onrender.com

---

## ✨ Features

### 👤 User Features
- **Authentication**: Secure Registration & Login using JSON Web Tokens (JWT).
- **Appointment Booking**: Select preferred date and time for doctor visits.
- **Validation Rules**: 
  - Prevents booking appointments in the past.
  - Prevents double booking for the same doctor at the same time.
- **Management Center**: View, delete, and check status (Pending / Approved / Rejected) of personal appointments.

### 🛡️ Admin Features
- **Doctor Management**: Add, update, and remove doctor profiles.
- **Department Management**: Add and delete hospital departments.
- **Appointment Control**: View all user appointments sorted by newest first.
- **Decisions**: Approve or reject pending appointments.

---

## 💻 Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs

---

## 📂 Project Structure

```text
doctor-appointment-mern/
├── frontend/          # React frontend application
├── models/            # Mongoose database schemas
├── routes/            # Express route handlers
├── config/            # Database and environment configurations
├── auth/              # JWT authorization middleware
├── uploads/           # Static asset/image storage
└── server.js          # Entry point for the Node.js backend server
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/user/register` | Register a new user |
| `POST` | `/user/signin` | Login user & return JWT |

### Doctors
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/doctors/allDoctors` | Retrieve list of all doctors |
| `POST` | `/doctors/addDoctors` | Add a new doctor (Admin) |
| `PUT` | `/doctors/:id` | Update doctor details (Admin) |
| `DELETE` | `/doctors/:id` | Remove a doctor (Admin) |

### Appointments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/appointments/createAppointment` | Book a new appointment |
| `GET` | `/appointments/myAppointments` | Get logged-in user's appointments |
| `PUT` | `/appointments/:id/status` | Update status [Approve/Reject] (Admin) |
| `DELETE` | `/appointments/:id` | Cancel/Delete an appointment |

### Departments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/departments/allDepartments` | Retrieve all departments |
| `POST` | `/departments/addDepartment` | Create a new department (Admin) |
| `DELETE` | `/departments/:id` | Delete a department (Admin) |

---

## 🔐 Security

- **Authentication**: Stateless JWT-based authentication.
- **Password Hashing**: Passwords securely hashed in the database before storage.
- **Protected Routes**: Middleware verifies tokens to protect administrative routes and personal user data.
- **Input Validation**: Backend validation to prevent invalid booking times (e.g., past dates, time conflicts).

---

## 🛠 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RoyEid/doctor-appointment-mern.git
   cd doctor-appointment-mern
   ```

2. **Backend Setup:**
   ```bash
   # Install dependencies
   npm install
   
   # Create a .env file based on the config requirements:
   # MONGO_URI=your_mongodb_connection_string
   # JWT_SECRET=your_secret_key
   # PORT=5000
   
   # Start the server
   npm run server
   ```

3. **Frontend Setup:**
   ```bash
   # Navigate to the frontend directory
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start the React development server
   npm start
   ```

---

## 🔮 Future Improvements

- Add email notifications for appointment approvals/rejections.
- Implement user profile image uploads and management.
- Introduce a real-time chat feature between patients and doctors.
- Add comprehensive unit and integration testing.
- Integrate a payment gateway for premium consultation fees.

---

## 👨‍💻 Author

**Roy Eid**  
- [GitHub](https://github.com/RoyEid)
- Project Link: [https://github.com/RoyEid/doctor-appointment-mern](https://github.com/RoyEid/doctor-appointment-mern)
