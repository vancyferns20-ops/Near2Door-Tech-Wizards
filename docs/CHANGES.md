# Near2Door Changes Log

## Session Overview
All changes were implemented to enhance platform stability, UX, and ship a complete shop registration & approval workflow with search and checkout features.

---

## 1. UI/UX Improvements

### A. Landing Page & Responsive Design
**Files Modified:** `frontend/src/pages/Landing.jsx`, `frontend/src/components/Layout/Header.jsx`, `frontend/src/App.jsx`
- Removed fragile absolute positioning from hero cards
- Implemented mobile-first responsive grid layout
- Scaled typography based on screen size
- Fixed horizontal overflow issues
- Applied reusable Tailwind classes for consistency

### B. Dark Theme Implementation
**Files Modified:** `frontend/src/pages/Landing.jsx`, `frontend/src/pages/auth/SignIn.jsx`, `frontend/src/pages/auth/SignUp.jsx`, `frontend/src/App.jsx`
- Changed Landing page background to dark navy (`bg-slate-900`)
- Updated all text colors for dark backgrounds
- Applied dark theme to authentication pages
- Updated App wrapper to use `bg-slate-950` globally
- Consistent shadow and border styling for dark mode

### C. Header Redesign
**Files Modified:** `frontend/src/components/Layout/Header.jsx`
- Restructured navbar from grid layout to flex layout
- Created proper left (brand), center (nav), right (profile/actions) sections
- Added user avatar display with initials (for non-shop users)
- Added user profile section showing name and role
- **Prominent logout button** visible on both desktop and mobile
- Redesigned mobile drawer with better spacing
- Dark theme consistent with overall app

### D. Footer Redesign
**Files Modified:** `frontend/src/components/Layout/Footer.jsx`
- Changed from white to dark (`bg-slate-950`) background
- Added three-column information grid (Platform, Support, Follow)
- Improved spacing with proper padding and borders
- Consistent styling with header

---

## 2. Framer-Motion Removal & Performance
**Files Modified:** Multiple import locations
- Isolated `framer-motion` from eagerly loaded routes
- Avoided importing the module at app startup to prevent 504 errors
- Reduced initial bundle complexity

---

## 3. Product Search Feature

### A. Search Bar Component
**Files Created:** `frontend/src/components/UI/SearchBar.jsx`
- Reusable search input component
- Supports both inline and form-submit modes
- Clear button when text is present
- Dark theme styling

### B. API Integration
**Files Modified:** `frontend/src/api/api.js`
- Added `searchProducts()` method with query + geolocation parameters
- Supports lat/lng + radius for proximity filtering
- Uses `VITE_API_BASE_URL` env variable for flexible API host

### C. Backend Search Endpoint
**Files Modified/Created:** `backend/routes.py`
- GET `/products/search` endpoint
- Regex-based product name/description/category matching
- Haversine distance calculation for proximity ranking
- Results sorted by distance when location provided
- Shop location metadata included in results
- Helper functions: `extract_shop_coordinates()`, `haversine_meters()`

### D. Browse Shops Integration
**Files Modified:** `frontend/src/pages/customer/BrowseShops.jsx`
- Integrated SearchBar for global product search
- Geolocation support (browser API)
- Radius filter buttons (1km, 5km, 10km, All)
- Query debouncing (300ms)
- Displays product results with shop details and distance
- **Sort toggle:** Best Match | Nearest | Cheapest
- **Add to Cart** buttons on individual products
- **Quantity selector** per product tile
- "Added" state confirmation on button

---

## 4. Cart Management

### A. Cart Normalization
**Files Modified:** `frontend/src/App.jsx`
- Centralized `addToCart` helper function
- Normalizes product shape (handles multiple ID/shop_id field names)
- Merges duplicate items (increments quantity)
- Ensures `shop_id` is always set (prevents "shop_id missing" errors)
- Applied to both `BrowseShops` and `ShopProducts` pages

### B. In-Shop Product Search
**Files Modified:** `frontend/src/pages/customer/ShopProducts.jsx`
- Added inline SearchBar for filtering within a shop
- Client-side filtering by product name/description

---

## 5. Shop Registration & Admin Workflow

### A. Enhanced SignUp Form
**Files Modified:** `frontend/src/pages/auth/SignUp.jsx`
- Added role-specific form fields
- When role = "shop", show:
  - Shop Name (required)
  - Shop Type
  - Location (required)
  - Profile Image URL
  - Description (textarea)
- Sends shop metadata in `payload.shop` to backend

### B. Backend Registration
**Files Modified:** `backend/routes.py`
- Enhanced `/auth/register` endpoint
- For shop role: creates shop document in MongoDB with status = "pending"
- Stores shop metadata (name, type, location, description, profileImage)
- Creates user with `status: "pending"`
- Blocks login for pending/rejected users

### C. Admin Approval UI
**Files Modified:** `frontend/src/pages/admin/AdminDashboard.jsx`
- Displays pending shops in list view
- Shows shop location and type inline
- "View" button opens modal with full shop details
- Modal displays: profile image, type, location, description
- Admin can approve or reject directly from modal
- Toast notices for approval/rejection actions

### D. Approval/Rejection Endpoints
**Files Modified:** `backend/routes.py`
- PUT `/admin/shops/<shop_id>/approve` - sets shop status to "open", user status to "approved"
- PUT `/admin/shops/<shop_id>/reject` - sets shop status to "rejected", stores rejection reason

---

## 6. Email Notifications & Audit Logging

### A. SMTP Configuration
**Files Created:** `backend/utils.py`
- `send_email()` helper with SMTP fallback
- Reads env vars: `SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL`
- Falls back to logging if SMTP not configured
- Safe to use in dev without breaking the app

### B. Audit Logging
**Files Modified:** `backend/db.py`, `backend/routes.py`
- Added `audits_col` collection to MongoDB
- On approve/reject: inserts audit record with action, shop_id, shop_name, admin, timestamp, details
- Tracks admin approvals and rejections for compliance

### C. Email Notifications
**Files Modified:** `backend/routes.py`
- On approval: sends email to shop owner with confirmation
- On rejection: sends email to shop owner with rejection reason
- Gracefully handles missing SMTP configuration

### D. Frontend Toast Feedback
**Files Modified:** `frontend/src/pages/admin/AdminDashboard.jsx`
- Added notice state for success/error/info messages
- Toast appears for 2.5-3.5 seconds after action

---

## 7. Environment & Configuration

### A. Backend Env Example
**Files Created/Modified:** `backend/.env.example`
```
MONGO_URI=mongodb://localhost:27017/Near2Door
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# SMTP email notifications
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@example.com
```

### B. Frontend Env Example
**Files Created:** `frontend/.env.example`
```
VITE_API_BASE_URL=https://didactic-parakeet-jxv5j6j96672p4jx-5000.app.github.dev
```

### C. CORS Configuration
**Files Modified:** `backend/__init__.py`
- Added Codespaces frontend/backend origins to allowlist
- Added local dev origins (localhost, 127.0.0.1)
- CORS properly configured for multi-environment support

### D. Backend Entrypoint Fix
**Files Modified:** `backend/app.py`, `backend/__init__.py`
- Fixed relative imports so app can be run from repo root
- Updated app.py to use proper package import: `from backend import create_app`
- Allows both `python backend/app.py` and importing backend as package

---

## 8. API Enhancements

### A. API Helper Methods
**Files Modified:** `frontend/src/api/api.js`
- `searchProducts()` - global product search with geolocation
- `rejectShop()` - admin rejection endpoint

### B. Backend Routes
**Files Modified:** `backend/routes.py`
- `/products/search` - GET endpoint for proximity-based product search
- `/admin/shops/<shop_id>/approve` - PUT to approve shop
- `/admin/shops/<shop_id>/reject` - PUT to reject with reason

---

## Summary of File Changes

### Frontend Files
- ✅ `frontend/src/App.jsx` - Dark background, cart normalization
- ✅ `frontend/src/pages/Landing.jsx` - Responsive redesign, dark theme
- ✅ `frontend/src/pages/auth/SignUp.jsx` - Shop registration fields
- ✅ `frontend/src/pages/auth/SignIn.jsx` - Dark theme
- ✅ `frontend/src/pages/customer/BrowseShops.jsx` - Search, sort, add-to-cart
- ✅ `frontend/src/pages/customer/ShopProducts.jsx` - In-shop search
- ✅ `frontend/src/pages/admin/AdminDashboard.jsx` - Shop review UI
- ✅ `frontend/src/components/Layout/Header.jsx` - Navbar redesign + logout
- ✅ `frontend/src/components/Layout/Footer.jsx` - Footer redesign
- ✅ `frontend/src/components/UI/SearchBar.jsx` - NEW reusable search component
- ✅ `frontend/src/api/api.js` - Search and reject API helpers
- ✅ `frontend/.env.example` - Environment template

### Backend Files
- ✅ `backend/app.py` - Fixed entrypoint imports
- ✅ `backend/__init__.py` - Relative imports, CORS config
- ✅ `backend/routes.py` - Search, approve, reject endpoints + email/audit
- ✅ `backend/db.py` - Added audits_col
- ✅ `backend/utils.py` - NEW SMTP email helper
- ✅ `backend/.env.example` - Backend config template

---

## Testing Status
- ✅ Frontend builds successfully (Vite)
- ✅ Backend syntax validated (py_compile)
- ✅ Backend app imports cleanly (no runtime errors)
- ⏳ Integration testing (manual browser testing recommended)
- ⏳ Unit tests (to be added)

---

## Next Steps
1. Run backend with SMTP configured to test email sending
2. Test shop registration flow end-to-end
3. Test admin approval workflow
4. Add unit tests for search logic
5. Add integration tests for cart normalization
6. Consider pagination for search results
7. Consider database indexes for search performance
