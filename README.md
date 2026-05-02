# Doctor Appointment MERN App

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://doctor-appointment-mern-nu.vercel.app)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A full-stack MERN application for booking doctor appointments with user, doctor, and admin role management.

## 🔗 Links

- **Live Demo:** [https://doctor-appointment-mern-nu.vercel.app](https://doctor-appointment-mern-nu.vercel.app)
- **Backend API:** [https://doctor-backend-46g2.onrender.com](https://doctor-backend-46g2.onrender.com)
- **GitHub Repository:** [https://github.com/RoyEid/doctor-appointment-mern](https://github.com/RoyEid/doctor-appointment-mern)

---

## 🔑 Demo Credentials

Use the following account to test the admin dashboard:

| Role | Email | Password |
| :--- | :--- | :--- |
| Admin | `admin@test.com` | `admin123` |

> [!NOTE]
> This account is for demo purposes only.

---

## 📖 Overview

The **Doctor Appointment MERN App** is a comprehensive healthcare management platform. It allows patients to easily find doctors by department, book appointments, and track their consultation history. 

- **Users** can register, browse medical departments, view detailed doctor profiles, and manage their own appointment requests.
- **Admins** have full control over the system, including managing the doctor database, organizing departments, and reviewing/processing appointment requests through a dedicated dashboard.

---

## ✨ Features

### 👤 User Features
- **Register & Login:** Secure authentication system for patients.
- **Browse Doctors:** Filter and view doctors based on their specialties.
- **View Departments:** Explore different medical departments.
- **Book Appointments:** Schedule consultations with specific doctors at available times.
- **Manage Appointments:** View personal booking history and cancel pending requests.

### 🛡️ Admin Features
- **Admin Authentication:** Secure login for administrative access.
- **Doctor Management:** Add new doctors to the system and update or remove existing ones.
- **Department Management:** Create and organize medical departments.
- **Appointment Oversight:** View all system appointments in a centralized list.
- **Status Management:** Approve or reject appointment requests.
- **Dashboard Statistics:** View high-level metrics of the platform's activity.

### 🩺 Doctor Profile Data
- Name and Email
- Professional Specialty
- Years of Experience
- Detailed Description/Biography
- Profile Image
- Available Appointment Slots/Dates

---

## 🔐 Authentication & Authorization

The application implements a secure, role-based access control (RBAC) system using **JSON Web Tokens (JWT)** and **bcryptjs** for password hashing.

### User Roles:
- **user:** Regular patient role for booking and managing personal appointments.
- **doctor:** Medical professional role (managed by admin).
- **admin:** Full administrative control over doctors, departments, and appointments.

---

## 💻 Tech Stack

### Frontend
- **React.js:** UI library for building the interface.
- **React Router:** For seamless client-side navigation.
- **Tailwind CSS:** For modern, responsive styling.
- **Axios / Fetch API:** For handling asynchronous API requests.

### Backend
- **Node.js & Express.js:** Server-side environment and framework.
- **JWT:** For secure authentication and session management.
- **bcryptjs:** For encrypting user passwords.
- **Multer:** For handling multi-part/form-data (image uploads).

### Database
- **MongoDB Atlas:** Cloud-hosted NoSQL database.
- **Mongoose:** ODM for MongoDB and Node.js.

### Deployment
- **Vercel:** Frontend hosting.
- **Render:** Backend API hosting.
- **MongoDB Atlas:** Database hosting.

---

## 📂 Project Structure

```text
doctor-appointment-mern/
├── auth/           # JWT & Authorization middleware
├── config/         # Database and server configurations
├── frontend/       # React client-side application
├── models/         # Mongoose schemas (User, Doctor, Appointment, Department)
├── routes/         # Express API route handlers
├── uploads/        # Static asset storage (e.g., doctor images)
├── utils/          # Helper functions and utilities
├── server.js       # Backend entry point
├── package.json    # Project dependencies and scripts
└── README.md       # Project documentation
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/user/register` | Register a new user account |
| `POST` | `/user/signin` | Login and receive a JWT token |

### Doctors
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/doctors/allDoctors` | Get a list of all available doctors |
| `POST` | `/doctors/addDoctors` | Create a new doctor profile (Admin only) |
| `PUT` | `/doctors/:id` | Update doctor information (Admin only) |
| `DELETE` | `/doctors/:id` | Remove a doctor from the system (Admin only) |

### Appointments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/appointments/createAppointment` | Book a new consultation |
| `GET` | `/appointments/myAppointments` | Fetch appointments for the logged-in user |
| `PUT` | `/appointments/:id/status` | Update appointment status (Admin only) |
| `DELETE` | `/appointments/:id` | Cancel/Delete an appointment |

### Departments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/departments/allDepartments` | Get all hospital departments |
| `POST` | `/departments/addDepartment` | Create a new department (Admin only) |
| `DELETE` | `/departments/:id` | Delete a department (Admin only) |

---

## ⚙️ Environment Variables

### Backend (`.env`)
```env
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_jwt_secret
PORT=10000
```

### Frontend (`.env`)
```env
REACT_APP_API_URL=https://doctor-backend-46g2.onrender.com
```

> [!IMPORTANT]
> Never commit your actual `.env` file to version control. Use a `.env.example` for reference.

---

## 🛠 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RoyEid/doctor-appointment-mern.git
   cd doctor-appointment-mern
   ```

2. **Setup Backend:**
   ```bash
   # Install backend dependencies
   npm install

   # Start the backend server
   npm start
   ```

3. **Setup Frontend:**
   ```bash
   # Navigate to the frontend directory
   cd frontend

   # Install frontend dependencies
   npm install

   # Start the React development server
   npm start
   ```

---

## 🚀 Deployment

- **Frontend:** Hosted on [Vercel](https://doctor-appointment-mern-nu.vercel.app).
- **Backend:** Hosted on [Render](https://doctor-backend-46g2.onrender.com).
- **Database:** Managed via **MongoDB Atlas**.

---

## 🛡️ Security Notes

- **Password Security:** All passwords are one-way hashed using `bcryptjs` before being stored.
- **JWT Protection:** State-less authentication ensures secure communication between client and server.
- **Route Protection:** Critical API endpoints are protected by middleware that validates the JWT.
- **Role-Based Access:** Administrative actions are strictly restricted to the `admin` role.
- **Safe Configuration:** Sensitive information is managed via environment variables and never committed to the repo.

---

## 🔮 Future Improvements

- [ ] **Email Notifications:** Automatic alerts for appointment confirmations.
- [ ] **Payment Integration:** Support for online consultation fee payments.
- [ ] **Availability Calendar:** Interactive calendar for doctor scheduling.
- [ ] **Advanced Analytics:** Detailed reporting for admins.
- [ ] **Automated Testing:** Implementation of Unit and Integration tests.
- [ ] **Real-time Chat:** Instant messaging between patients and doctors.

---

## 👨‍💻 Author

**Roy Eid**
- **GitHub:** [RoyEid](https://github.com/RoyEid)
- **Project Repo:** [doctor-appointment-mern](https://github.com/RoyEid/doctor-appointment-mern)
- **Live Demo:** [Visit App](https://doctor-appointment-mern-nu.vercel.app)
