# Production Deployment Guide for Vercel

## Issues Fixed

✅ **20+ Hardcoded localhost URLs** → Replaced with environment variables  
✅ **Missing API Configuration** → Created centralized API config  
✅ **No Environment Variables** → Set up .env.local and .env.example  
✅ **Production API URL** → Now configurable via environment variables

## Setup Instructions

### 1. Local Development

The `.env.local` file is already configured for local development:

```bash
REACT_APP_API_URL=http://localhost:5000
```

No additional setup needed for `npm start` locally.

### 2. Vercel Deployment

#### Step 1: Deploy Your Backend

First, deploy your Node.js backend to a hosting service (Heroku, Railway, Render, etc.) and note the deployed URL.

Example deployed backend URL:

```
https://your-backend-domain.com
```

#### Step 2: Add Environment Variable to Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name:** `REACT_APP_API_URL`
   - **Value:** `https://your-backend-domain.com` (your deployed backend URL)
   - **Environments:** Select "Production" (and "Preview" if needed)

#### Step 3: Redeploy

Push a new commit to trigger a rebuild, or manually redeploy:

```bash
vercel --prod
```

### 3. File Structure

```
frontend/
├── .env.local          # Local development (gitignored)
├── .env.example        # Template for environment variables
├── src/
│   ├── config/
│   │   └── api.js      # 👈 Centralized API configuration
│   ├── components/
│   ├── pages/
│   └── ...
```

## How It Works

The `api.js` configuration file automatically uses:

- `process.env.REACT_APP_API_URL` on production
- Falls back to `http://localhost:5000` for local development

All API endpoints are now imported from this single source:

```javascript
import { apiConfig } from "../config/api";

// Use it in fetch calls:
fetch(apiConfig.getAllDoctors);
fetch(apiConfig.createAppointment);
fetch(apiConfig.getImageUrl(filename));
```

## Common Issues & Solutions

### Issue: 404 errors on Vercel after deployment

**Cause:** `REACT_APP_API_URL` environment variable not set

**Solution:**

- Go to Vercel Settings → Environment Variables
- Verify `REACT_APP_API_URL` is set to your deployed backend URL
- Click "Save" and redeploy

### Issue: CORS errors in production

**Cause:** Backend is rejecting requests from your Vercel domain

**Solution:** Update your backend's CORS configuration:

```javascript
// In your backend (server.js or index.js)
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:3000", // Local development
      "https://your-vercel-domain.com", // Your deployed frontend
    ],
    credentials: true,
  }),
);
```

### Issue: Images not loading on Vercel

**Cause:** Image URLs still contain hardcoded localhost

**Solution:** Already fixed! All image URLs now use `apiConfig.getImageUrl()`

## Testing

1. **Verify Environment Variable:**

   ```bash
   # In your project root
   echo $REACT_APP_API_URL
   ```

2. **Build Test:**

   ```bash
   npm run build
   ```

3. **Check Production Build:**
   ```bash
   npx serve -s build
   ```

## Files Modified

- ✅ `frontend/src/config/api.js` (created)
- ✅ `frontend/.env.local` (created)
- ✅ `frontend/.env.example` (created)
- ✅ `frontend/src/components/Login.jsx`
- ✅ `frontend/src/components/Register.jsx`
- ✅ `frontend/src/components/Doctors.jsx`
- ✅ `frontend/src/components/Departments.jsx`
- ✅ `frontend/src/components/Stats.jsx`
- ✅ `frontend/src/pages/AllDoctors.jsx`
- ✅ `frontend/src/pages/DoctorDetails.jsx`
- ✅ `frontend/src/pages/AddDoctor.jsx`
- ✅ `frontend/src/pages/AddAppointment.jsx`
- ✅ `frontend/src/pages/AddDepartment.jsx`
- ✅ `frontend/src/pages/MyAppointments.jsx`

## Next Steps

1. ✅ Test locally: `npm run build && npx serve -s build`
2. ✅ Push changes to GitHub
3. ✅ Set `REACT_APP_API_URL` in Vercel dashboard
4. ✅ Redeploy on Vercel
5. ✅ Test all API endpoints (login, fetch doctors, create appointment, etc.)

---

**Your app is now production-ready for Vercel deployment! 🚀**
