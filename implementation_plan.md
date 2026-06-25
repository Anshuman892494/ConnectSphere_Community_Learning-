# Implementation Plan - ConnectSphere Community Learning & Social Q&A Platform

ConnectSphere is a full-stack community learning and social Q&A platform built using the MERN stack (MongoDB, Express, React, Node.js). The application is designed as a modern SaaS-style platform with rich aesthetics, light/dark mode, social feeds, Q&A systems, gamification points, login history monitoring, user profile management, Razorpay payment gateway integration, and role-based administration dashboard.

---

## Architecture & System Design

We will structure the repository into two primary folders:
1. `backend/` - Node.js + Express API server, MongoDB + Mongoose databases, JWT Auth, Payment backend, and Admin operations.
2. `frontend/` - React + Vite SPA, Tailwind CSS for modern aesthetics, Redux Toolkit for state management, Axios API layer.

### Directory Layout

```
ConnectSphere/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Razorpay, Cloudinary config
│   │   ├── controllers/     # Controller logic
│   │   ├── middleware/      # Auth, RBAC, error handlers
│   │   ├── models/          # Mongoose models (User, Post, QA, etc.)
│   │   ├── routes/          # Express API route endpoints
│   │   └── index.js         # Entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── common/      # Reusable UI controls (AppButton, AppInput, etc.)
    │   │   ├── layout/      # Shell elements (Navbar, Sidebar, PageContainer)
    │   │   └── forms/       # Specific forms (LoginForm, PostForm)
    │   ├── pages/           # High-level screens
    │   ├── hooks/           # Custom React hooks (useAuth, useTheme)
    │   ├── services/        # Axios clients & API request definitions
    │   ├── store/           # Redux slices and setup
    │   ├── routes/          # React Router layout and routing
    │   ├── utils/           # Formatters and helpers
    │   ├── constants/       # Options, pricing, labels
    │   ├── contexts/        # React context wrappers
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── tailwind.config.js
    └── package.json
```

---

## Backend Design (Node.js + Express + MongoDB)

### Data Models
1. **User Model** (`User.js`):
   - Basic details: `username`, `email`, `password` (hashed), `avatar`, `bio`.
   - Security/Role: `role` (`'user' | 'admin'`), `isBlocked` (boolean).
   - Social: `friends` (Array of user refs), `friendRequests` (Array of user refs).
   - Points & Rep: `points` (number, default 100), `reputation` (number, default 0).
   - Subscription: `subscription` object containing:
     - `status` (`'free' | 'premium'`)
     - `plan` (`'silver' | 'gold' | 'platinum'`)
     - `expiresAt` (Date)
     - `razorpaySubscriptionId` (String)

2. **LoginHistory Model** (`LoginHistory.js`):
   - Reference to User, `ipAddress`, `userAgent`, `status` (`'success' | 'failed'`), `timestamp`.

3. **Post Model** (`Post.js`):
   - Reference to User, `type` (`'text' | 'photo' | 'video'`), `mediaUrl`, `caption`, `likes` (Array of user refs), `comments` (Array of `{ user, text, createdAt }`), `createdAt`.

4. **Question Model** (`Question.js`):
   - Reference to User, `title`, `body`, `tags` (Array of strings), `votes` (Array of user refs), `upvotesCount`, `downvotesCount`, `resolved` (boolean), `acceptedAnswer` (Answer ref), `createdAt`.

5. **Answer Model** (`Answer.js`):
   - Reference to User, Question ref, `body`, `votes` (Array of user refs), `upvotesCount`, `downvotesCount`, `accepted` (boolean), `createdAt`.

6. **PointTransfer Model** (`PointTransfer.js`):
   - `sender` (User ref), `receiver` (User ref), `points` (number), `description`, `createdAt`.

7. **SubscriptionTransaction Model** (`SubscriptionTransaction.js`):
   - Reference to User, `razorpayOrderId`, `razorpayPaymentId`, `planName`, `amount`, `status`, `createdAt`.

### API Routes
- `/api/auth` - Login, Register, Current User, Security/Login History.
- `/api/users` - Profiles, Friend Actions, User Search, Ranking (Points).
- `/api/posts` - CRUD for posts, comments, likes.
- `/api/qa` - Questions CRUD, Answers CRUD, voting, answer acceptance.
- `/api/transfers` - Points transfer action.
- `/api/subscriptions` - Razorpay order creation, payment verification.
- `/api/admin` - Admin stats, block/unblock, content moderation.

---

## Frontend Design (React + Tailwind CSS)

### Reusable UI Components
Every component will be implemented in its own file to maintain clean code standards:
- **`PageContainer`**: Standard page layout handling grid and sidebars.
- **`SectionHeader`**: Page titles with subtitles and actions.
- **`AppButton`**: Custom styling variants (primary, secondary, danger, ghost) with loading states.
- **`AppInput`**: Sleek styling with floating labels, error boundary styling, and helper texts.
- **`AppTextarea`**: Responsive text area matching AppInput.
- **`AppSelect`**: Styled custom select dropdown.
- **`AppModal`**: Generic glassmorphism overlay dialog for confirmations/forms.
- **`AppTable`**: Data presentation table with built-in responsive styling.
- **`AppCard`**: Hover-responsive container with premium border gradients.
- **`AppBadge`**: Micro-badges for reputation, points, roles, and status tags.
- **`AppAvatar`**: User profile avatar with fallback initials and activity rings.
- **`AppPagination`**: Slick page selection controls.
- **`AppLoader`**: Skeleton loader and spinner components for skeleton loading rules.
- **`EmptyState`**: Visually appealing "no items found" graphics and subtexts.
- **`ErrorState`**: Styled error boundaries or recovery cards.

### App Pages
- **Auth Pages**: Login and Register (with beautiful gradients, glass forms, active field styling).
- **Feed Page**: List posts (photo/video), file upload forms (using local file/Cloudinary simulation), likes/comments actions.
- **Q&A System Page**: Question board with search, filters (unanswered, top voted, tags), ask question modals, answer list, accepted checks.
- **Profile Page**: User cards, credentials edit, listing friends list, past posts.
- **Point Transfer Page**: Interactive modal / form to transfer reputation points with security validation and logs.
- **Subscriptions Page**: Plan cards (Silver, Gold, Platinum) with checkout flow using Razorpay.
- **Login History/Security Monitoring**: Page listing login histories, IPs, agents, and active sessions.
- **Admin Dashboard**: System logs, database status, quick actions to toggle user bans, dashboard metrics charts.

---

## Verification Plan

### Automated Verification
- We will set up automated routes testing using scripts, and build verification on the frontend.
- Since we have a React frontend and Node backend, we'll verify they both run and compile without errors.

### Manual Verification
- We will verify that the client can fetch from the server via API controllers.
- Verification of Razorpay integration by mocking payment gateways and providing transparent sandbox flows.
- Visual inspection of the Dark/Light mode theme toggle.
- Flow validation: Register -> Login -> Security Log -> Edit Profile -> Add Question -> Post Answer -> Upvote QA.
