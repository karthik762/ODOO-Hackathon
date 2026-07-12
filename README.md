# AssetFlow ERP

**AssetFlow** is a production-ready Enterprise Asset & Resource Management ERP system. It is designed to handle corporate hardware lifecycles, resource reservations, maintenance tickets, and dynamic reports.

---

## 🚀 Tech Stack

### Frontend
* **React** (Vite)
* **React Router DOM** (Single Page App routing)
* **Axios** (API communication layer)
* **Vanilla CSS** (Premium glassmorphism, dark/light modes, micro-animations, Outfit/Inter typography)

### Backend
* **Node.js & Express.js** (REST API)
* **MongoDB & Mongoose** (Database)
* **Multer** (Media uploads middleware)
* **JWT & bcryptjs** (Authentication & roles protection)

---

## 📦 Modules Built

### 1. Authentication & Security
* Secure User Registration and Login with bcrypt password encryption.
* JWT stateless token sessions stored securely in the client state.
* Dual-layered route protection:
  * `PrivateRoute` (guards authenticated access)
  * `RoleRoute` (enforces role clearance filters: `['Admin', 'AssetManager', 'DepartmentHead', 'Employee']`)

### 2. Organization Management
* **Departments CRUD**: Tracks departments, codes, descriptions, and department heads.
* **Categories CRUD**: Manages catalog groupings (Laptops, Vehicles, Meeting Rooms, etc.).
* **Employee Directory**: Allows admins to view users, change roles, and disable/enable user accounts.

### 3. Asset Management
* Full CRUD for hardware assets (name, serial number, model, category, cost, and department).
* Asset allocation: link assets to employees and track status transitions (`Available`, `Assigned`, `Maintenance`, `Retired`).
* Media attachments: file uploads for asset photos using Multer (saves to `/uploads/` and serves statically).
* Client-side search, category/department filters, and server-side pagination.

### 4. Resource Booking
* Shared resource reservations (Meeting Rooms, Vehicles, Projectors, and Conference Rooms).
* **Conflict Overlap Rejection**: Backend queries overlapping schedules `(startDate < proposedEnd) && (endDate > proposedStart)` and blocks conflicting reservations.
* Visual calendar scheduler view alongside history log tables with cancellation capabilities.

### 5. Maintenance Workflow
* Issue ticketing: raise repair requests for cracked screens, broken parts, etc.
* Multi-stage progression: `Reported (Pending)` ➔ `Approved (In Repair)` ➔ `Resolved / Rejected`.
* **Automated Asset Sync**: Approving a ticket automatically swaps the asset's status to `Maintenance`, and resolving/rejecting it reverts it to `Available`.
* Resolution cost auditing and comments logging.

### 6. Dashboard & Reporting
* **Admin Dashboard**: System-wide summaries (asset value counts, total booking volumes, active repair costs) and responsive SVG charts.
* **Employee Dashboard**: Self-service workspace showing assigned items, upcoming schedules, active notifications, and tickets.
* **CSV Export**: Downloads spreadsheet files for assets and booking records directly from backend text generators.

---

## 🛠️ Installation & Setup

### 1. Prerequisites
* **Node.js** (v18+)
* **MongoDB** (Local or MongoDB Atlas instance)

### 2. Environment Setup
Create a `.env` file in the project root:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/assetflow
JWT_SECRET=supersecretjwtkeyforassetflowprod2026
```

### 3. Installation
Install dependencies in both directories:
```bash
# Server Dependencies
cd server
npm install

# Client Dependencies
cd ../client
npm install
```

### 4. Run Development Servers
```bash
# Start backend (server/ runs nodemon on port 5000)
cd server
npm run dev

# Start frontend (client/ runs vite on port 5173)
cd ../client
npm run dev
```

### 5. Build for Production
To bundle the frontend for production:
```bash
cd client
npm run build
```
This outputs compiled static assets inside `client/dist`.

---

## 🧬 Project Structure

```text
AssetFlow/
├── client/                 # Frontend Workspace
│   ├── src/
│   │   ├── components/     # Reusable UI (Form, Calendar, Sidebar)
│   │   ├── context/        # AuthContext State
│   │   ├── layouts/        # Page Shell Wrap (Layout.jsx)
│   │   ├── pages/          # View Router pages (Login, Dashboard, Assets)
│   │   ├── services/       # Axios API config
│   │   ├── App.jsx         # Routing Registry
│   │   └── main.jsx        # App mounting point
├── server/                 # Backend Workspace
│   ├── config/             # Database connectivity
│   ├── controllers/        # REST Route logic handlers (MVC)
│   ├── middleware/         # Auth, Uploads, and Roles guards
│   ├── models/             # Mongoose Schemas (MVC)
│   ├── routes/             # API Router definitions (MVC)
│   ├── uploads/            # Uploaded asset photos
│   └── server.js           # Server starter file
└── README.md               # ERP Documentation
```
