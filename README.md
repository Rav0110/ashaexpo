# PS-19: Village Health Worker Digital Assistant

## 🏥 Project Overview

An **offline-first mobile health assistant for ASHA (Accredited Social Health Activist) workers** in rural India. The app enables frontline health workers to register patients, record health visits, detect high-risk cases, and queue alerts — all without internet. When connectivity returns, the system syncs urgent alerts first to a real-time web dashboard where doctors and supervisors can monitor and respond.

## ⚕️ Problem Statement

ASHA workers serve 800–1000 people in rural areas with poor/no internet connectivity. They currently rely on paper registers which causes:
- Delayed detection of high-risk pregnancies, TB cases, and malnutrition
- Lost or incomplete records during field visits  
- No way to alert doctors about urgent cases in real time
- Manual, error-prone government health reports

This app digitizes the entire workflow with an **offline-first architecture** that works reliably in low-connectivity environments.

## 🛠 Tech Stack

### Mobile App
| Technology | Purpose |
|---|---|
| React Native + Expo SDK 51 | Mobile framework |
| expo-sqlite | Local offline database |
| @react-native-community/netinfo | Connectivity detection |
| Firebase Firestore JS SDK | Remote sync target |
| React Navigation | Screen navigation |
| uuid | Local ID generation |

### Web Dashboard
| Technology | Purpose |
|---|---|
| React + Vite | Dashboard frontend |
| Firebase Firestore | Real-time alert feed |
| Browser Audio API | Alert sound notification |
| window.print() | Report export |

## 🏗 Offline-First Architecture

```
┌─────────────────────┐     ┌──────────────────┐
│   ASHA Mobile App   │     │   Web Dashboard   │
│                     │     │                   │
│  ┌───────────────┐  │     │  Firestore        │
│  │   SQLite DB   │──┼──►  │  onSnapshot()     │
│  │  (offline)    │  │     │  Real-time alerts  │
│  └───────────────┘  │     │  + Reports         │
│         │           │     └──────────────────┘
│  ┌───────────────┐  │
│  │  Sync Queue   │  │
│  │  Priority:    │  │
│  │  1. Alerts    │  │
│  │  2. Visits    │  │
│  │  3. Patients  │  │
│  └───────────────┘  │
└─────────────────────┘
```

**Key architectural decisions:**
- **SQLite is the ONLY offline store.** All data is saved to SQLite first.
- **Firestore offline persistence is intentionally disabled.** We do NOT call `enableIndexedDbPersistence()`.
- **Sync is queue-based with priorities.** Alerts sync before visits, visits before patients.
- **Saving never blocks on network.** All saves complete instantly from SQLite.

## 📱 Mobile Setup

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or Camera app (iOS).

### Firebase Configuration
Edit `mobile/src/services/firebase.js` and replace the placeholder config with your Firebase project credentials:

```js
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};
```

## 💻 Dashboard Setup

```bash
cd dashboard
npm install
npm run dev
```

Dashboard opens at `http://localhost:3000`.

Edit `dashboard/src/firebase/firebase.js` with the same Firebase credentials.

## 🔥 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Cloud Firestore** in test mode
3. Copy your web app config to both `mobile/src/services/firebase.js` and `dashboard/src/firebase/firebase.js`
4. Deploy the Firestore rules from `firestore.rules`

## 📦 Firestore Collections

### `patients`
```js
{ id, name, age, sex, village, phone, asha_id, condition_type, created_at }
```

### `visits`
```js
{ id, patient_id, patient_name, village, asha_id, visit_type, bp_systolic, bp_diastolic,
  temperature_c, muac_cm, bleeding, seizure, breathlessness, tb_cough_weeks,
  tb_followup_missed, vaccination_due, vaccination_given, raw_note, parsed_fields,
  risk_level, risk_flags, created_at }
```

### `alerts`
```js
{ id, visit_id, patient_id, patient_name, village, risk_level, risk_flags,
  status, asha_phone, created_at, acknowledged_at }
```

## 🔒 Firestore Rules (Demo)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ **These are DEMO-ONLY rules.** In production, implement proper authentication and authorization.

## 🎬 Demo Flow

1. **Turn on airplane mode** → demonstrates offline-first
2. **Add patient**: Sunita Devi, age 17, pregnancy, Rampur
3. **Add ANC visit**: BP 155/100, bleeding=yes, note: "BP high hai, khoon bhi aa raha hai"
4. **Parser extracts** BP and bleeding from Hindi note
5. **Risk engine detects**: HIGH_BP_PREGNANCY, BLEEDING_PREGNANCY, TEEN_PREGNANCY
6. **Visit saves offline**, alert is queued
7. **Pending Sync screen** shows 1 alert + 1 visit pending
8. **Turn off airplane mode** → sync starts automatically
9. **Dashboard receives alert** in real time with audio notification
10. **Doctor clicks Acknowledge** → alert marked as acknowledged
11. **Mobile Report screen** shows local village health summary

## ❌ Features Intentionally Not Built

These were excluded by design for the hackathon scope:

- Firebase Authentication / Login screens
- User role management
- Full localization system (partial Hindi labels included)
- FCM push notifications
- EAS / native builds
- Firestore offline persistence (SQLite is the sole offline store)
- Analytics
- ASHA onboarding / tutorial flow
- Multi-ASHA coordination
- Complex PDF generation
- AI/ML workflows that require network

## 📄 License

Hackathon demo project — PS-19 Village Health Worker Digital Assistant.
