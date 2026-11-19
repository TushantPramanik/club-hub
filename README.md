# ClubHub — The All-in-One Smart Campus Operating System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Theme](https://img.shields.io/badge/Default%20Theme-Indigo%20Steel%20Spectrum-4F46E5?style=for-the-badge)](http://localhost:8000)

**ClubHub** is a production-ready, full-stack smart campus operating platform built with **FastAPI**, **SQLAlchemy**, and a responsive modern frontend (**HTML5**, **CSS3**, **Vanilla ES6+ JavaScript**). It unifies extracurricular club management, student candidacy approval workflows, central campus event ticketing with digital entry passes, campus collaboration feeds, and cryptographically verifiable digital achievement badges.

---

## 🚀 Quick Start (Single Command)

### 1. Prerequisites
- **Python 3.10+** installed
- Git installed

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Application
```bash
python run.py
```

The application starts on **[http://localhost:8000](http://localhost:8000)**.
Interactive Swagger API documentation is available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## 🎨 Theme: "Indigo Steel Spectrum" (Default)

ClubHub loads with **Indigo Steel Spectrum** as the default theme on first visit for every user:
- **Primary Indigo:** `#4F46E5` (brand accents, links, active navigation)
- **Deep Indigo:** `#1E1B4B` (navbar, headers, and footer)
- **Steel Text:** `#64748B` | **Page Background:** `#F8FAFC` | **Borders:** `#E2E8F0`
- **Warm Accent Buttons:** Amber `#F59E0B` / Coral `#F97316` (Join Club, Register, Approve)
- **Status Badges:** Approved/Member `#10B981` | Pending `#F59E0B` | Rejected `#EF4444`
- **Subtle Gradient:** Indigo-to-violet spectrum header
- **Category Colors:** Distinct custom tags for Tech, Cultural, Sports, Innovation, etc.
- **Theme Switcher & Light/Dark Mode:** Persisted in `localStorage` with full dark mode contrast.

---

## 🔑 Key Features & Modules

### 1. Real User Authentication (Zero Default / Mock Users)
- **Guest Visitor State:** Clean navbar with prominent **"Log In"** and **"Sign Up"** buttons. No hardcoded users (`Aditya Verma` has been removed).
- **Secure Registration:** Students register with Name, Email, Department, Year, and Password. Passwords are securely hashed with `bcrypt`.
- **JWT Authorization:** Session management using standard JSON Web Tokens (`Bearer <token>`).
- **Profile Chip:** Once authenticated, displays the user's real initials, name, and a one-click **Sign Out** option.
- **Route & Action Guards:** Actions such as chartering a club, requesting to join, registering for events, or posting require authentication and redirect guests automatically to the login page.

### 2. Clubs: Candidacy & Admin Approval Workflow
- **Charter a Club:** Any logged-in student can create a club and automatically becomes its coordinator/admin.
- **Join Club Button:** Creates an application with status `"Pending"`. Button state immediately transforms to `"Request Pending"`.
- **Duplicate Prevention:** Prevents duplicate requests and joining clubs where the student is already a member.
- **Club Admin Secretariat (`admin.html`):**
  - Club-specific coordinator access: coordinators can only view and manage join requests for clubs they own.
  - Approve / Reject action buttons: Approving immediately enrolls the student into the club's member roster; Rejecting updates status and allows re-application.
- **My Clubs Section (`dashboard.html`):** Real-time reflection of user's active club memberships, coordinated societies, and pending join requests.

### 3. Campus Events & Digital Ticketing (`events.html`)
- Discover campus workshops, hackathons, and cultural events.
- Filter by category and search dynamically.
- Register for events to receive a verified **Digital Entry Pass** (`PASS-XXXXX-EVT-X`) complete with a simulated entry verification QR code.
- Club coordinators can schedule and publish new events directly from the dashboard.

### 4. Student Peer Collab Feed (`network.html`)
- Campus-wide collaboration board for hackathons, study groups, and project partner searches.
- Category tags: `#Collab`, `#HackathonTeam`, `#StudyGroup`, `#ProjectCollab`, `#CampusLife`.
- Create discussions, upvote posts, and reply with comments in real time.

### 5. Verifiable Digital Badges (`dashboard.html`)
- Cryptographically verifiable digital achievement badges issued by club coordinators.
- Includes unique SHA-256 verification hash IDs, issuance timestamps, and issuer details.

### 6. Dynamic Public Statistics
- No fake or hardcoded metrics (`"30+ clubs"`, `"2,400+ students"` removed).
- Database starts clean and unpopulated. Empty states (e.g., *"No clubs yet – create the first one"*) guide new visitors.
- Homepage counters dynamically calculate from real database counts (`/dashboard/public`).

---

## 🛠️ Configuration & Environment Variables

Create a `.env` file in the project root if you wish to override default settings (see `.env.example`):

```ini
# JWT Configuration
SECRET_KEY=clubhub-super-secure-production-jwt-secret-key-2025
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# SQLite Database Location (defaults to ./clubclash.db)
DATABASE_URL=sqlite:///./clubclash.db

# CORS Allowed Origins
CORS_ORIGINS=http://localhost:8000,http://127.0.0.1:8000
```

---

## 🧪 Automated Testing

ClubHub includes a comprehensive end-to-end test suite testing all 18 authentication, club creation, join request, approval, event registration, and collab feed flows:

```bash
python test_e2e.py
```

---

## 📁 Project Structure

```text
club-hub/
├── run.py                     # Single-command launcher (FastAPI + Static Files)
├── test_e2e.py                # Automated end-to-end test suite
├── requirements.txt           # Python dependencies
├── .env.example               # Environment variables template
├── index.html                 # Homepage with real dynamic stats
├── clubs.html                 # Clubs catalog with dynamic join states
├── club-details.html          # Dynamic club detail page & join request modal
├── events.html                # Events catalog & digital ticketing
├── network.html               # Collab discussion feed & comments drawer
├── dashboard.html             # Student command center (My Clubs, Passes, Badges)
├── admin.html                 # Club Admin Dashboard (Approve/Reject requests)
├── login.html                 # Real student authentication sign-in
├── register.html              # Student registration form
├── backend/
│   ├── main.py                # FastAPI app initialization & static mount
│   ├── database.py            # SQLAlchemy database engine & session maker
│   ├── models.py              # Database models (Student, Club, Application, etc.)
│   ├── schemas.py             # Pydantic v2 validation models
│   ├── auth.py                # Passlib/bcrypt password hashing & JWT utilities
│   ├── dependencies.py        # Current user & role dependency injection
│   ├── seed.py                # Clean schema initializer (no mock data)
│   └── routers/
│       ├── auth.py            # /auth/register, /auth/login, /auth/me
│       ├── clubs.py           # /clubs CRUD & join requests table
│       ├── applications.py    # /applications join requests & approve/reject
│       ├── events.py          # /events scheduling & pass registration
│       ├── network.py         # /network posts, upvotes & comments
│       ├── badges.py          # /badges issuance & verification
│       ├── dashboard.py       # /dashboard/public dynamic stats
│       ├── students.py        # /students/my-clubs profile endpoints
│       └── admin.py           # Admin administrative endpoints
├── css/
│   ├── palette.css            # Indigo Steel Spectrum theme & Coolors palettes
│   ├── style.css              # Core typography, reset & layout
│   ├── components.css         # UI components (buttons, badges, modals, toasts)
│   ├── home.css               # Homepage layout & cards
│   ├── clubs.css              # Club directory styling
│   ├── club-details.css       # Club detail & banner layouts
│   ├── events.css             # Event cards & digital ticket passes
│   ├── network.css            # Collab feed & comments styling
│   ├── dashboard.css          # Student command center tabs
│   ├── admin.css              # Club admin candidate review tables
│   └── auth.css               # Login & sign-up forms
└── js/
    ├── api.js                 # Unified frontend API client (fetch + JWT)
    ├── common.js              # Navbar auth state, toasts, navigation drawer
    ├── palette.js             # Theme switcher & dark mode controller
    ├── auth.js                # Login & registration form controller
    ├── home.js                # Dynamic homepage stats fetcher
    ├── clubs.js               # Club catalog search, filter & join modal
    ├── club-details.js        # Club profile & join request controller
    ├── events.js              # Events catalog & digital pass generator
    ├── network.js             # Collab feed upvote, post & comment handler
    ├── dashboard.js           # Student command center controller
    └── admin.js               # Club Admin Dashboard approval/reject controller
```

---

## 📄 License
This project is open-source under the MIT License.
