# 🏥 Doctor Appointment MERN App

A full-stack web application built with the **MERN stack** that allows users to book doctor appointments easily and enables admins to manage doctors and departments efficiently.

---

## 🚀 Features

### 👤 User
- Register & Login (JWT Authentication)
- Book appointments
- View personal appointments
- Delete appointments

### 👨‍⚕️ Admin
- Add doctors (with image upload)
- Add departments
- Manage system data

---

## 🛠 Tech Stack

| Layer       | Technology            |
|------------|----------------------|
| Frontend    | React, Tailwind CSS  |
| Backend     | Node.js, Express     |
| Database    | MongoDB Atlas        |
| Auth        | JWT (JSON Web Token) |

---

## 📂 Project Structure

```
doctor-appointment-mern/
│
├── frontend/       # React frontend
├── models/         # Mongoose schemas
├── routes/         # API routes
├── config/         # Database connection
├── auth/           # Authentication middleware
├── uploads/        # Uploaded images
├── server.js       # Backend entry point
```

---

## ⚙️ Installation & Setup

### 🔹 1. Clone the repository

```bash
git clone https://github.com/RoyEid/doctor-appointment-mern.git
cd doctor-appointment-mern
```

---

### 🔹 2. Install dependencies

#### Backend
```bash
npm install
```

#### Frontend
```bash
cd frontend
npm install
cd ..
```

---

### 🔹 3. Environment Variables

Create a `.env` file in the root directory:

```env
MONGO_URI=your_mongodb_connection_string
SECRET_KEY=your_secret_key
PORT=5000
```

---

### 🔹 4. Run the application

#### Start backend
```bash
npm start
```

#### Start frontend
```bash
cd frontend
npm start
```

---

## 🌐 API Endpoints

### 🔐 Authentication
- POST `/user/register`
- POST `/user/signin`

---

### 👨‍⚕️ Doctors
- POST `/doctors/addDoctors`
- GET `/doctors/allDoctors`
- GET `/doctors/count`
- GET `/doctors/byspecialty/:specialty`
- GET `/doctors/:id`

---

### 📅 Appointments
- POST `/appointments/createAppointment`
- GET `/appointments/myAppointments`
- POST `/appointments/deleteAppointment/:id`

---

### 🏥 Departments
- POST `/departments/addDepartment`
- GET `/departments/allDepartments`
- GET `/departments/count`

---

## 🔐 Authentication & Security

- JWT-based authentication
- Protected routes for users and admins
- Role-based access control (Admin/User)

---

## ⚠️ Limitations

- No appointment conflict validation yet
- No email notifications
- Basic admin panel (can be improved)

---

## 🔮 Future Improvements

- Add doctor availability scheduling
- Add email notifications for appointments
- Implement payment system
- Improve UI/UX design
- Add admin dashboard analytics

---

## 🧪 Testing

You can test API endpoints using:
- Postman
- Thunder Client (VS Code)

---

## 📜 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

**Roy Eid**

- GitHub: https://github.com/RoyEid

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
