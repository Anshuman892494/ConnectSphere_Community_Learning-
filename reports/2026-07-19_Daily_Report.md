# Daily Progress Report
**Date:** July 19, 2026
**Project:** Elevance Skills (ConnectSphere Community Learning)

## 🚀 Tasks Completed Today

### 1. Profile Picture Upload & External URL Integration
- **Segmented Image Input Control:** Redesigned the Edit Profile modal inside `Profile.jsx` to render a styled tab control allowing users to switch between **Upload Image** (file selector) and **Image URL** (external text input).
- **FormData Backend Uploads:** Configured the file upload logic to submit the raw file immediately via Axios to `POST /api/users/profile/avatar`.
- **Absolute Path Resolution:** Dynamically replaced the `/api` prefix from `VITE_API_URL` to resolve and store absolute backend file URLs for the avatar source.
- **Dynamic Image Preview:** Rendered a live circular/square thumbnail preview with fallback handlers for invalid links, plus a delete button to clear selections. Included a loading spinner and disabled submit actions during active file uploads.

### 2. Remote Database Latency & Connection Speedups
- **Forced IPv4 Address Lookups:** Added `dns.setDefaultResultOrder('ipv4first')` in the backend entrypoint (`index.js`) to resolve hostnames via IPv4 before attempting slow IPv6 lookups.
- **Connection Optimization:** Configured `family: 4` in Mongoose database connections inside `db.js`.
- **Latency Resolution:** Resolved the remote MongoDB Atlas cluster connection setup delays from 7-10 seconds to less than 1.5 seconds, preventing Mongoose query buffering timeouts. Removed all local fallbacks to ensure production safety.

### 3. Exposed Dynamic Global Stats (About Popover)
- **Public API Exposure:** Removed the `protect` middleware constraint from the `/api/posts/global-stats` route in `post.routes.js`, making the endpoint public.
- **Visitor Statistics Rendering:** Enabled the "About" popover in the top navigation bar to successfully query actual live database counts (Registered Users, Posted Questions, Tag Collectives) even for logged-out/guest visitors, replacing hardcoded mock statistics.

### 4. Nodemailer SMTP Migration to Brevo
- **Brevo SMTP Credentials:** Configured `SMTP_HOST=smtp-relay.brevo.com` and `SMTP_PORT=587` in `backend/.env`.
- **Sender Validation Alignment:** Configured the `EMAIL_FROM` variable to match the Brevo-registered email to avoid SMTP sending authentication errors.

### 5. Git Version Control & Code Push
- **5-Part Commit Staging:** Organized and committed all modifications into 5 distinct logical chunks (Backend Connection Optimizations, Controllers/Models, Frontend API/Settings, Avatar Uploads, and Layout polishing).
- **Pushed to Origin:** Successfully pushed all 5 commits to the remote GitHub repository at `main` branch.

---

## 📁 Key Files Modified

### Backend
- [index.js](file:///c:/Users/anshu/OneDrive/Desktop/Elevance_Skills/backend/src/index.js) (Modified)
- [db.js](file:///c:/Users/anshu/OneDrive/Desktop/Elevance_Skills/backend/src/config/db.js) (Modified)
- [post.routes.js](file:///c:/Users/anshu/OneDrive/Desktop/Elevance_Skills/backend/src/routes/post.routes.js) (Modified)
- [.env](file:///c:/Users/anshu/OneDrive/Desktop/Elevance_Skills/backend/.env) (Modified)

### Frontend
- [api.js](file:///c:/Users/anshu/OneDrive/Desktop/Elevance_Skills/frontend/src/services/api.js) (Modified)
- [Profile.jsx](file:///c:/Users/anshu/OneDrive/Desktop/Elevance_Skills/frontend/src/pages/Profile.jsx) (Modified)
- [AboutPopover.jsx](file:///c:/Users/anshu/OneDrive/Desktop/Elevance_Skills/frontend/src/components/layout/Navbar/AboutPopover.jsx) (Modified)

---

## 📊 Summary

Today we successfully added **avatar local uploading and external URL integrations** in the Edit Profile modal, optimized **remote MongoDB Atlas connections to resolve 7-10s database buffering timeouts**, exposed **global server stats publicly** to make the navigation popover dynamic for guests, migrated **Nodemailer SMTP to Brevo**, and pushed all changes to the remote branch across **5 separate commits**.
