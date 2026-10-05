# Community Food Donation Network

**Tagline**: *“Save Food. Share Food. Serve Lives.”*

---

## 📌 Project Overview
The **Community Food Donation Network** is an enterprise-ready, social-impact web application designed to connect event organizers, caterers, and food donors with verified Non-Governmental Organizations (NGOs). The platform enables prompt rescue and distribution of fresh surplus food to vulnerable communities, eliminating edible food waste.

---

## 🎯 Problem Statement & Objectives
- **The Challenge**: Millions of tons of catered banquet food are thrown away while local shelters face acute food shortages.
- **The Solution**: A structured digital network featuring real-time availability feeds, strict pickup deadlines, food safety pledges, and atomic single-NGO reservation locks.

---

## 👥 Primary User Roles

### 1. 🍽️ DONOR (Event Organizer / Caterer)
- Register & Login with persistent role identity.
- Post surplus food listings with food name, quantity, unit, dietary type (Vegetarian vs Non-Vegetarian), prepared timestamp, pickup deadline, dock location, description, and photo.
- Mandatory food safety suitability confirmation.
- Dashboard tracking total, available, accepted, picked up, and completed donations.
- Cancel eligible available listings (`AVAILABLE` → `CANCELLED`).
- View and update profile.

### 2. 🏛️ NGO (Relief Foundation / Shelter)
- Register & Login with organization identity.
- Browse available food listings with real-time keyword search, dietary type, location, and min quantity filter panel.
- Detailed listing inspect view with donor contact info and food safety pledge.
- **Single-NGO Atomic Acceptance**: Claim available food listing via Firestore atomic transaction (`runTransaction`).
- Manage accepted pickups (`ACCEPTED` → `PICKED UP` → `COMPLETED`).
- View rescue history.

### 3. 🛡️ ADMIN (Platform Moderation & Operations)
- System-wide analytical statistics dashboard (Total Users, Donors, NGOs, Listings by state).
- User Moderation: View user registry, search accounts, block/unblock accounts to restrict write access.
- Donation Audit: Inspect all listings across all lifecycle states.

---

## 🔄 Donation Lifecycle & Concurrency Architecture

### Lifecycle State Machine
```
         [AVAILABLE]
        /           \
   (Donor Cancel)  (NGO Accept via Atomic Transaction)
      /               \
[CANCELLED]        [ACCEPTED]
                       |
               (Assigned NGO Pick Up)
                       v
                  [PICKED UP]
                       |
             (Assigned NGO Complete)
                       v
                  [COMPLETED]
```

### Atomic Single-NGO Acceptance Concurrency Engine
To guarantee two NGOs can **never** accept the same donation concurrently:
- Firestore `runTransaction` reads the document inside an isolated transaction.
- Verifies current status is `AVAILABLE` and NGO is not blocked.
- Atomically sets `status = 'ACCEPTED'`, `acceptedBy = ngoUid`, `acceptedAt = serverTimestamp()`.
- If two requests land simultaneously, exactly 1 succeeds and the other is rejected with a user-friendly error: *"This donation has already been accepted by another NGO."*

---

## 🛠️ Technology Stack
- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
- **Authentication**: Firebase Authentication (Email/Password)
- **Database**: Cloud Firestore (Atomic Transactions & Composite Indexes)
- **Media Hosting**: Cloudinary (`community_food_uploads` unsigned preset, strict JPG/PNG/WEBP validation under 5MB)
- **Interactive Maps**: MapTiler Maps API & SDK (`@maptiler/sdk`, custom pin markers, explicit browser geolocation)
- **Routing**: React Router v7 (Role-Gated Protected Routes)
- **Deployment**: Vercel (`vercel.json` SPA rewrite rules)

---

## 🗺️ Interactive Maps & Pickup Location Selection
- **MapTiler Integration**: Powered by `@maptiler/sdk` for responsive, lightweight pickup location maps.
- **Donor Geolocation ("Use My Current Location")**: Explicit button trigger using `navigator.geolocation` (`enableHighAccuracy: true`, `timeout: 10000`, `maximumAge: 0`) with graceful permission-denied fallbacks.
- **Manual Pinning & Search**: Allows donors to click anywhere on the map or search landmarks to pin precise pickup coordinates (`pickupCoordinates: { latitude, longitude }`).
- **NGO Map Visualization**: Interactive map display on NGO donation detail page (`/ngo/donations/:id`) with marker at saved pickup coordinates.

---

## 🔐 Security Architecture & Rules (`firestore.rules`)
- **Role Verification**: Server-side checks against `users/{uid}.role`.
- **Ownership Gating**: Donors can only modify/cancel their own listings.
- **NGO Assignment Gating**: Only the assigned NGO (`acceptedBy == request.auth.uid`) can transition `ACCEPTED` → `PICKED_UP` → `COMPLETED`.
- **Blocked User Enforcement**: `isBlocked == true` accounts are denied all Firestore writes.

---

## 🚀 Environment Variables (`.env.example`)

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=food-donation2-0
VITE_CLOUDINARY_UPLOAD_PRESET=community_food_uploads

# MapTiler Configuration
VITE_MAPTILER_API_KEY=fHmj3StwwZUZesRYJX3x

# Demo Mode Toggle (set to "false" for live production credentials)
VITE_ENABLE_DEMO_MODE=false
```

---

## 💻 Local Setup & Development

1. **Clone & Navigate**:
   ```bash
   cd CommunityFoodDonationNetwork
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 🧪 Testing Strategy
- **Single-NGO Concurrency Suite**: Executable via `tests/run-concurrency.ts`. Simulates simultaneous acceptance requests from NGO A and NGO B against an available donation and verifies 1 success and 1 rejection.

---

## 🚀 Deployment Readiness (Vercel)
The project includes `vercel.json` configured for SPA routing.

---

## 🔮 Future Scope
- Mobile Native Apps (iOS & Android)
- Automated SMS/Push Notifications for nearby NGOs
- Machine Learning surplus food volume prediction
- Cold-chain temperature sensor integration
