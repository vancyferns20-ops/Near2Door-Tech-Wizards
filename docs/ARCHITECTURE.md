# Architecture & Features Guide

## Platform Architecture

```
Near2Door (Hyperlocal E-Commerce Platform)
├── Frontend (React + Vite)
│   ├── Public Pages: Landing, About, How It Works
│   ├── Auth Pages: Sign Up, Sign In
│   ├── Customer Pages: Dashboard, Browse Shops, Shop Products, Cart
│   ├── Shop Pages: Dashboard, Manage Products, Manage Orders, Update Profile
│   ├── Admin Pages: Dashboard (Shop Approval, Stats)
│   └── Delivery Pages: Agent Dashboard
├── Backend (Flask + MongoDB)
│   ├── Auth Routes: Register, Login
│   ├── Shop Routes: CRUD + Approval Workflow
│   ├── Product Routes: Search (with proximity)
│   ├── Cart Routes: (managed client-side)
│   ├── Order Routes: Place, Track, Update Status
│   └── Admin Routes: Approve/Reject Shops & Agents
└── Database (MongoDB)
    ├── users (customers, shops, agents, admins)
    ├── shops (with status: pending/rejected/open)
    ├── products (linked to shops)
    ├── orders
    ├── audits (approval history)
    └── finances
```

---

## Key Features

### 1. Product Search with Proximity Filtering
- **Client:** SearchBar component + sort toggle
- **Server:** Regex matching on name/description/category
- **Location-Based:** Haversine distance calculation
- **Sorting:** Best match (relevance) | Nearest | Cheapest
- **Responsive:** Works on mobile, shows distance in meters

### 2. Dynamic Cart Management
- **Normalization:** Handles multiple product ID field names
- **Duplicate Handling:** Auto-merge items with quantity increment
- **Shop Tracking:** Ensures shop_id is always set
- **Inline Quantity:** Users can adjust qty before adding

### 3. Shop Registration Workflow
```
Customer fills shop form (name, location, type, image)
        ↓
Backend creates shop with status=pending
        ↓
Admin reviews shop details in AdminDashboard
        ↓
Admin approves/rejects with email notification
        ↓
Shop owner receives email + gains access to Shop Dashboard
```

### 4. Role-Based Access Control (RBAC)
| Role | Pages | Special | 
|------|-------|---------|
| Customer | Browse, Cart, Dashboard | Can search products nearby |
| Shop | Dashboard, Manage Items/Orders | Can only see after approval |
| Agent | Agent Dashboard | Delivery person |
| Admin | Admin Dashboard | Approve shops/agents |

### 5. Email Notifications (SMTP)
- **On Approval:** "Your shop has been approved"
- **On Rejection:** "Your shop was not approved - reason provided"
- **Fallback:** Logs to stdout if SMTP not configured
- **Security:** Reads from env, no hardcoded credentials

### 6. Audit Logging
- **Collection:** audits_col in MongoDB
- **Events:** shop_approve, shop_reject
- **Fields:** action, shop_id, shop_name, admin, timestamp, reason/details
- **Purpose:** Compliance & admin audit trail

---

## DarkTheme & UI Updates
- **Header:** Dark slate-950 with user avatar + logout button
- **Footer:** Dark with info sections (Platform, Support, Follow)
- **Landing:** Dark navy background, responsive cards
- **Auth Pages:** Dark theme with proper spacing
- **Overall:** Consistent padding, shadows, and color scheme

---

## Configuration Files

### Backend (.env)
```
MONGO_URI=mongodb://...
CLOUDINARY_CLOUD_NAME=...
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
FROM_EMAIL=...
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000
```

### CORS Origins (Backend)
- Production: https://near2-door-tech-wizards.vercel.app
- Codespaces Frontend/Backend
- Local: localhost:5173, :5000

---

## Technology Stack

### Frontend
- React 19
- Vite (build tool)
- Tailwind CSS (styling)
- React Hooks (state management)
- Fetch API (HTTP)

### Backend
- Flask 3.0.3
- PyMongo 4.8 (MongoDB)
- Flask-CORS 4.0
- Cloudinary (image upload)
- smtplib (email)

### Database
- MongoDB (NoSQL)
- Collections: users, shops, products, orders, agents, finances, audits

---

## API Endpoints

### Authentication
- POST `/auth/register` - Register user/shop/agent
- POST `/auth/login` - Login (checks status=pending)

### Products
- GET `/shops/<shop_id>/products` - Get shop products
- GET `/products/search` - Search products by name/description + proximity
  - Query params: q (search), lat, lng, radius, shopId (optional)

### Shops
- GET `/shops` - List all open shops
- GET `/shops/<shop_id>` - Get shop profile
- PUT `/shops/<shop_id>` - Update shop profile

### Admin
- GET `/admin/shops?status=pending` - List pending shops
- GET `/admin/shops?status=open` - List approved shops
- PUT `/admin/shops/<shop_id>/approve` - Approve shop (status→open, email→owner)
- PUT `/admin/shops/<shop_id>/reject` - Reject shop (status→rejected, email→owner)

### Orders
- POST `/orders` - Place order
- GET `/customers/<customer_id>/orders` - Get customer orders
- PUT `/orders/<order_id>/delivery-status` - Update delivery status

### Agents
- GET `/agents` - List agents
- GET `/agents/<agent_id>/orders` - Get agent's assigned orders
- GET `/agents/<agent_id>/earnings` - Get agent earnings

---

## Development Workflow

### Starting the App

**Backend:**
```bash
cd backend
export MONGO_URI=mongodb://...
export SMTP_HOST=smtp.gmail.com  # Optional
python app.py
# Runs at http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

### Building for Production

**Frontend:**
```bash
npm run build
# Output: dist/
```

**Backend:**
```bash
gunicorn app:app --bind 0.0.0.0:5000
```

### Environment Setup

Copy env examples and fill in actual values:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

---

## Known Limitations & Future Work

1. **Search Scalability:** 
   - Current: Linear scan of products
   - Future: Add MongoDB text indexes or Elasticsearch

2. **Email Queuing:**
   - Current: Synchronous SMTP in request path
   - Future: Async with Redis + RQ for reliability

3. **Pagination:**
   - Current: No limit on search results
   - Future: Implement cursor-based pagination

4. **Rate Limiting:**
   - Current: None
   - Future: Add per-IP or per-user rate limits

5. **Testing:**
   - Current: Manual integration testing
   - Future: Full unit + integration test suite

---

## Performance Considerations

- **Frontend:** Vite provides fast HMR, tree-shaking, and production builds
- **Search:** Debounced 300ms client-side to avoid excessive requests
- **Cart:** Normalized in-memory - not persisted to backend
- **Auth:** Simple JWT dummy tokens (replace with real JWT in production)
- **Images:** Cloudinary for image optimization and delivery

---

## Security Notes

⚠️ **Development Only:**
- Dummy tokens (should use real JWT)
- Passwords stored in plaintext (use bcrypt in production)
- No input validation (add schema validation)
- CORS configured but open to trusted origins

⚠️ **Production Checklist:**
1. Replace dummy tokens with real JWT
2. Hash passwords with bcrypt
3. Add comprehensive input validation
4. Add rate limiting
5. Enable HTTPS
6. Use environment-based config
7. Add logging & monitoring
8. Add database backups
9. Test email configuration before deployment
