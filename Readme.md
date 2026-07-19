# ConnectSphere (Elevance Skills) - Project Documentation

ConnectSphere is a premium, feature-rich **Social Learning & Community Q&A Platform** designed for developers and learners. It combines StackOverflow-like developer Q&A features with a community Social Space, an integrated reputation/points engine, multi-language support secured by OTP validation, and a subscription-based model with customized posting limits.

---

## 🛠️ Technology Stack

### Frontend (Client-side)
* **Framework:** React 19 (built with Vite)
* **State Management:** Redux Toolkit & React Redux
* **Routing:** React Router DOM (v7)
* **Styling:** Tailwind CSS (v4) with Custom Glassmorphism UI
* **Icons:** Lucide React
* **Content Rendering:** React Markdown, Remark GFM, Rehype Sanitize, and React Syntax Highlighter (for code block rendering)
* **Authentication:** Google OAuth2 (`@react-oauth/google`) and custom token-based flows
* **Payments:** Razorpay Checkout SDK (dynamically injected and cleaned up)

### Backend (Server-side)
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB with Mongoose (ODM)
* **Authentication & Security:** JSON Web Tokens (JWT) with secure httpOnly cookies, BcryptJS for password hashing, and Express Rate Limit
* **Email Gateway:** Resend HTTP API (via native Node `fetch`) for custom domain email transactional alerts
* **SMS Gateway:** Twilio SMS API integration (simulated during development)
* **Media Uploads:** Multer for local uploads and Cloudinary integration support
* **Payments:** Razorpay API Node.js library

---

## 🚀 Key Features & Capabilities

### 1. User Authentication & Session Security
* **Dual Login Flows:** Traditional Email/Password authentication and Google OAuth integration.
* **Session Management:** Secure access token generation (15-minute expiry) and refresh tokens (30-day expiry) stored in HTTP-only cookies.
* **Active Devices & History:** Logs and displays user session details including OS, Browser, IP address, and login time.
* **Mobile Login Restriction:** Mobile device logins are restricted to a specific window of **10:00 AM to 1:00 PM IST** to control access patterns.

### 2. Verified Multilingual & Custom Themes
* **Multi-Language Support:** Fully localizable application supporting six languages: English (`en`), Spanish (`es`), Hindi (`hi`), Portuguese (`pt`), Chinese (`zh`), and French (`fr`).
* **Secure Language Swaps:** Switching languages requires verification OTP codes.
    * French (`fr`) switches require a 6-digit OTP sent to the user's email via Resend.
    * Other languages require a 6-digit OTP sent to the user's registered phone number via SMS.
    * Development safety banner shows `_devOtp` directly on the screen for easy sandbox testing.
* **Glassmorphic UI & Custom Themes:** Aesthetic, glass-like UI cards with gradient accents. Users can switch between Light, Dark, or System-based styling preferences.

### 3. Developer Q&A Feed (StackOverflow Style)
* **Markdown Post Editor:** Supports rich markdown text, links, lists, images, and inline/block code syntax highlighting.
* **Tag Aggregation:** Organizes posts into distinct search categories/tags.
* **Comment & Answer Engine:** Users can write answers (comments) to questions, bookmark questions to save them, or share them.
* **Accepted Answer Flow:** Question creators can mark a specific answer as "Accepted", locking it in place.

### 4. Mutual Connection & Social Space
* **Social Space Feed:** A distinct feed (`/social`) that displays posts marked with `isSocial: true`.
* **Mutual Friend System:** Users can send/toggle friend connections. A mutual connection must be established to register as "friends".
* **Spam Control Limits:** Posting on the Social Space is bounded by the user's friend count:
    * **0 Friends:** Not allowed to post on the public social space.
    * **1 Friend:** Allowed a limit of 1 social post per day.
    * **2–10 Friends:** Allowed a limit of 2 social posts per day.
    * **>10 Friends:** Unlimited social posting.

### 5. Reputation & Gamification Engine
* **Question Voting:** Upvoting a question grants the author **+10** reputation. Downvoting deducts **-2** reputation from the author.
* **Answer Voting:** Upvoting an answer grants the author **+10** reputation. Downvoting deducts **-2** reputation.
* **Self-Voting Block:** Users cannot vote on their own questions or answers.
* **High-Quality Answer Bonus:** Answers that reach **5 upvotes** receive a bonus **+5** reputation points.
* **Accepted Answer Points:** Marking an answer as accepted rewards the answer author with **+15** reputation and the question asker with **+2** reputation.
* **Points Transfer System:** Users can transfer reputation points directly to other users, provided the sender has a reputation balance **greater than 10**.

### 6. Subscription Model & Limits
* ConnectSphere limits daily question submissions based on subscription tiers:
    * **Free Plan:** 1 question/day
    * **Bronze Plan:** 5 questions/day (Cost: ₹100/month)
    * **Silver Plan:** 10 questions/day (Cost: ₹300/month)
    * **Gold Plan:** Unlimited questions/day (Cost: ₹1000/month)
* **Restricted Payment Hour:** Purchases/Upgrades through Razorpay can only be conducted between **10:00 AM and 11:00 AM IST**.

---
