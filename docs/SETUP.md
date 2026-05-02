# Setup & Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js >= 18
- Python >= 3.9
- MongoDB >= 5.0 (local or Atlas)
- Git

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your values:
   # MONGO_URI=mongodb://localhost:27017/Near2Door
   # CLOUDINARY_* credentials
   # SMTP_* for email (optional, can skip in dev)
   ```

3. **Run MongoDB locally** (if using local instance):
   ```bash
   mongod --dbpath /path/to/data
   ```

4. **Start the backend server:**
   ```bash
   python app.py
   # Server runs at http://localhost:5000
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env if using a different API host
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. **Start the dev server:**
   ```bash
   npm run dev
   # Frontend runs at http://localhost:5173
   ```

4. **Open in browser:**
   ```bash
   open http://localhost:5173
   ```

---

## Codespaces Deployment

### Setup Steps

1. **Forward ports:**
   - Backend: 5000 (Flask)
   - Frontend: 5173 (Vite)
   - MongoDB: 27017 (if local)

2. **Get Codespaces URLs:**
   - Frontend: `https://didactic-parakeet-jxv5j6j96672p4jx-5173.app.github.dev`
   - Backend: `https://didactic-parakeet-jxv5j6j96672p4jx-5000.app.github.dev`

3. **Update frontend .env:**
   ```
   VITE_API_BASE_URL=https://didactic-parakeet-jxv5j6j96672p4jx-5000.app.github.dev
   ```

4. **Backend CORS already includes Codespaces origins** - no changes needed

---

## MongoDB Atlas Setup (Cloud)

1. **Create cluster:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Whitelist your IP (or 0.0.0.0 for dev)

2. **Get connection string:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/Near2Door?retryWrites=true&w=majority
   ```

3. **Set in .env:**
   ```
   MONGO_URI=mongodb+srv://...
   ```

---

## Email Configuration (Gmail Example)

1. **Enable 2-Factor Authentication** on Gmail account

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the app password

3. **Update .env:**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=your-email@gmail.com
   ```

4. **Restart backend** - emails will now be sent on shop approval/rejection

---

## Cloudinary Image Upload Setup

1. **Create free account:**
   - Go to https://cloudinary.com/users/register/free

2. **Get credentials:**
   - Dashboard → Account Details
   - Copy Cloud Name, API Key, API Secret

3. **Update .env:**
   ```
   CLOUDINARY_CLOUD_NAME=abc123
   CLOUDINARY_API_KEY=key123
   CLOUDINARY_API_SECRET=secret123
   ```

---

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
# Output: dist/
# Deploy to Vercel, Netlify, or static hosting
```

**Vercel Deployment:**
```bash
npm install -g vercel
vercel
# Follow prompts, set VITE_API_BASE_URL in project settings
```

### Backend Deployment

```bash
# Using Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Using Heroku
heroku login
heroku create your-app-name
git push heroku main
```

**Heroku Environment Variables:**
```bash
heroku config:set MONGO_URI=mongodb+srv://...
heroku config:set SMTP_HOST=smtp.gmail.com
# ... etc
```

---

## Running Tests

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
# Or run individual test file
python -m pytest tests/test_search.py -v
```

### Frontend Tests
```bash
cd frontend
npm test
# Or run specific test
npm test -- SearchBar.test.js
```

---

## Troubleshooting

### Backend Won't Start

**Error:** `ModuleNotFoundError: No module named 'flask'`
- **Fix:** Run `pip install -r requirements.txt` in backend/

**Error:** `ConnectionFailure: unable to connect to database`
- **Fix:** Ensure MongoDB is running or MONGO_URI points to valid Atlas cluster

**Error:** `CORS error in browser console`
- **Fix:** Check that frontend URL is in CORS allowlist in `backend/__init__.py`

### Frontend Won't Build

**Error:** `npm ERR! code ENOENT, syscall open`
- **Fix:** Delete `node_modules/` and `package-lock.json`, run `npm install`

**Error:** `VITE_API_BASE_URL is undefined`
- **Fix:** Create `frontend/.env` file with correct API URL

### Email Not Sending

**Check logs:** 
```bash
# Backend logs will show SMTP errors or fallback logging
tail -f backend_output.log
```

**Verify SMTP settings:**
```bash
# Test Gmail app password is correct
# Ensure 2FA is enabled on Gmail account
```

---

## Development Best Practices

### Code Style
- Frontend: Use Tailwind classes, avoid inline styles
- Backend: Follow PEP 8, use snake_case for Python
- Comments: Add docstrings for functions and complex logic

### Git Workflow
```bash
git checkout -b feature/shop-approval
# ... make changes ...
git commit -m "feat: add shop approval workflow"
git push origin feature/shop-approval
# Create Pull Request on GitHub
```

### Testing Before Push
```bash
# Frontend
npm run build

# Backend
python -m py_compile backend/*.py
python app.py  # Quick smoke test (Ctrl+C to quit)
```

---

## Monitoring & Logs

### Backend Logs
- Check Flask console output for errors
- Consider adding centralized logging (Winston, Sentry)

### Frontend Logs
- Browser DevTools Console (F12)
- Check Network tab for API errors

### Database
```bash
# Check MongoDB logs
# Atlas: Cloud → Monitoring → Logs
# Local: Check mongod output

# Access MongoDB shell
mongosh
use Near2Door
db.shops.find()  # View shops
db.audits.find()  # View audit trail
```

---

## Performance Optimization

### Frontend
- Use `npm run build` to verify production build size
- Enable gzip compression on static server
- Use CDN for static assets
- Consider lazy loading for routes

### Backend
- Add MongoDB indexes for search queries
- Implement caching for frequently accessed data
- Use connection pooling for database
- Consider read replicas for scaling

### General
- Enable GZIP compression
- Use CDN for images (Cloudinary already does this)
- Monitor response times
- Set up alerts for error rates

---

## Security Checklist

Before deploying to production:

- [ ] Replace dummy JWT tokens with real JWT library
- [ ] Hash passwords with bcrypt
- [ ] Add input validation & sanitization
- [ ] Enable HTTPS everywhere
- [ ] Set strong CORS policies
- [ ] Add rate limiting
- [ ] Hide sensitive env vars
- [ ] Enable MongoDB authentication
- [ ] Set up database backups
- [ ] Configure error logging (don't expose stack traces)
- [ ] Add CSRF protection
- [ ] Validate file uploads (images)
- [ ] Add audit logging for sensitive operations
- [ ] Use environment-based config
