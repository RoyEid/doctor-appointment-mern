# Role-Based Authentication System - Complete Guide

## Overview

This MERN application now supports comprehensive role-based access control (RBAC) with three distinct roles: **user**, **admin**, and **doctor**.

## User Roles

### 1. **User Role**

- Can register and login
- Can view doctors and departments
- Can create appointments
- Can view their own appointments
- Can cancel their appointments
- Limited to viewing services they're authorized for

### 2. **Admin Role**

- Full access to the system
- Can create/update/delete doctors
- Can create/update departments
- Can view all appointments from all users
- Can update appointment statuses
- Can manage the entire application

### 3. **Doctor Role**

- Can login and access their dashboard
- Can view appointments assigned to them
- Can update appointment status (approve/reject)
- Can update appointment times (for available slots)
- Cannot access admin panels

## Backend Implementation

### Database Schema

**UserSchema** (`models/UserSchema.js`)

```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ["user", "admin", "doctor"], default: "user")
}
```

### Authentication Middleware

**Location**: `auth/Middleware.js`

The middleware now supports role-based access control:

```javascript
// Protect route - any authenticated user
router.get("/myAppointments", auth(), handler);

// Protect route - specific role required
router.post("/addDoctors", auth("admin"), handler);
router.put("/:id", auth("admin"), handler);
router.put("/status", auth(), handler); // Role checked inside
```

**Role-checking inside handlers**:

```javascript
if (req.user.role === "admin") {
  // Admin-only logic
}

if (req.user.role === "doctor") {
  // Doctor-only logic
}
```

### JWT Token Structure

JWT tokens now include:

```javascript
{
  id: user._id,
  email: user.email,
  role: user.role,
  iat: timestamp,
  exp: expiration
}
```

### API Endpoints

#### **User Routes** (`routes/user.js`)

- `POST /user/register` - Register new user (defaults to "user" role)
- `POST /user/signin` - Login any user (returns role in response)

**Response**:

```json
{
  "message": "user Logged In successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### **Doctor Routes** (`routes/doctor.js`)

- `POST /doctors/addDoctors` - **[ADMIN ONLY]** Create doctor & user account
- `GET /doctors/allDoctors` - Get all doctors
- `GET /doctors/:id` - Get doctor details
- `PUT /doctors/:id` - **[ADMIN ONLY]** Update doctor
- `DELETE /doctors/:id` - **[ADMIN ONLY]** Delete doctor

#### **Appointment Routes** (`routes/appointment.js`)

- `POST /appointments/createAppointment` - Create appointment (any authenticated user)
- `GET /appointments/myAppointments` - Get appointments (filtered by role)
- `PUT /appointments/:id/status` - Update appointment (admin or assigned doctor)
- `POST /appointments/deleteAppointment/:id` - Delete appointment

## Frontend Implementation

### Authentication Context

**Location**: `frontend/src/context/AuthContext.jsx`

Provides:

- `user` - Current user object with role
- `login(token, userData)` - Store token and user data
- `logout()` - Clear authentication
- `isLoading` - Loading state during initialization
- `hasRole(requiredRole)` - Check if user has required role

**Usage**:

```javascript
const { user, login, logout, hasRole } = useContext(AuthContext);

if (hasRole("admin")) {
  // Show admin controls
}

if (hasRole(["admin", "doctor"])) {
  // Show admin or doctor controls
}
```

### Route Protection

**Location**: `frontend/src/components/RoleBasedRoute.jsx`

Protect routes with role requirements:

```javascript
// In App.js
<Route
  path="/admin/appointments"
  element={<RoleBasedRoute element={<AdminAppointments />} requiredRole="admin" />}
/>

<Route
  path="/doctor/appointments"
  element={<RoleBasedRoute element={<DoctorAppointments />} requiredRole="doctor" />}
/>

// Multiple roles
<Route
  path="/edit-doctor/:id"
  element={<RoleBasedRoute element={<EditDoctor />} requiredRole={["admin", "manager"]} />}
/>
```

**Behavior**:

- If user not logged in → Show "You need to login" page
- If user not authorized → Show "Access Denied" page
- If authorized → Show requested component

### Navigation Component

**Location**: `frontend/src/components/Navbar.jsx`

Automatically shows role-based navigation:

- **Admin**: Admin Dashboard, Add Doctor, Add Department
- **User**: Add Appointment, My Appointments
- **Doctor**: Doctor Dashboard
- User role badge displayed in navigation

### Login Component

**Location**: `frontend/src/components/Login.jsx`

After successful login, redirects based on role:

- `admin` → `/admin/appointments`
- `doctor` → `/doctor/appointments`
- `user` → `/`

## Creating Users with Different Roles

### Method 1: Registration (Creates "user" role)

```bash
POST /user/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Method 2: Admin Creates Doctor

Admin can create doctor account via UI:

```
Navigate → Add Doctor → Fill form
```

This endpoint creates both User account (with "doctor" role) and Doctor profile.

### Method 3: Direct Database (Development Only)

```javascript
// Create admin or doctor directly
const admin = await User.create({
  name: "Admin User",
  email: "admin@example.com",
  password: hashedPassword,
  role: "admin",
});
```

## Security Features

✅ **Password Hashing**: Bcrypt 10-salt rounds
✅ **JWT Authentication**: 1-week expiration
✅ **Role-Based Access Control**: Backend + Frontend
✅ **Protected Routes**: Frontend guard + API authentication
✅ **Authorization Checks**: Backend validates user role for sensitive operations
✅ **Token Storage**: Secure localStorage implementation

## Workflow Examples

### User Booking an Appointment

1. User registers (role = "user")
2. User logs in → token + user data stored
3. Navbar shows "Add Appointment" link
4. User creates appointment → API validates auth token
5. Appointment created with user's ID

### Admin Managing Doctors

1. Admin logs in → redirected to `/admin/appointments`
2. Admin clicks "Add Doctor" link
3. Admin fills form with doctor details
4. Frontend submits to `/doctors/addDoctors`
5. Backend validates `auth("admin")` middleware
6. Both User account (role="doctor") and Doctor profile created

### Doctor Viewing Appointments

1. Doctor logs in (role = "doctor")
2. Redirected to `/doctor/appointments`
3. Backend `/appointments/myAppointments` queries:
   - Finds Doctor profile by userId
   - Returns appointments for that Doctor's ID
4. Doctor can approve/reject appointments

## Testing the System

### Test Admin Access

```bash
# Create admin (manually in DB for now)
# Login with admin credentials
# Should see Admin Dashboard, Add Doctor, Add Department
```

### Test Doctor Access

```bash
# Admin creates a doctor
# Doctor logs in
# Should only see Doctor Dashboard
# Cannot see admin controls
```

### Test User Access

```bash
# Register as new user
# Login
# Should see Add Appointment, My Appointments
# Cannot see admin or doctor controls
```

## Troubleshooting

### User can't see role-based features

- Verify token contains role: Check browser DevTools → Application → localStorage
- Check `AuthContext` is properly passed via `AuthProvider`
- Verify `RoleBasedRoute` wraps the component

### 403 Access Denied on API

- Verify JWT token is valid: Check in Postman with Authorization header
- Backend middleware is checking role: Confirm `auth("role")` on route
- User has correct role: Check user document in MongoDB

### Redirect loops on login

- Verify Login component passes user data: `login(data.token, data.user)`
- Check role value returned from backend matches route requirements

## Future Enhancements

- [ ] Add role selection during registration
- [ ] Implement permission matrix for fine-grained control
- [ ] Add role management UI for admins
- [ ] Implement audit logging for admin actions
- [ ] Add two-factor authentication
- [ ] Implement role-based API rate limiting
