# 🛡️ OZONE DLP — Admin Dashboard

**Centralized Admin Panel for the OZONE Data Loss Prevention System.**

This repository contains both the **Frontend Admin Dashboard** (React/Vite) and the **Backend ConfigSync Server** (Node.js/Express) that together allow security administrators to remotely manage endpoint DLP policies.

---

## 📁 Project Structure

```
Ozone_FY_Project/
├── Frontend Admin/       # React + Vite + TypeScript dashboard
│   ├── components/       # Reusable UI components
│   ├── services/         # API service layer
│   ├── App.tsx           # Main application component
│   ├── index.tsx         # Entry point
│   ├── constants.tsx     # UI constants & configuration
│   ├── types.ts          # TypeScript type definitions
│   ├── index.html        # HTML template
│   ├── vite.config.ts    # Vite configuration
│   ├── tsconfig.json     # TypeScript configuration
│   └── package.json      # Frontend dependencies
│
├── Backend Server/       # Express + TypeScript config sync server
│   ├── server.ts         # Main server file (API + EC2 sync)
│   ├── tsconfig.json     # TypeScript configuration
│   └── package.json      # Backend dependencies
│
├── Commands List.txt     # Quick-reference commands
├── package.json          # Root-level shared dependency (node-ssh)
└── README.md             # This file
```

---

## ⚙️ Prerequisites

- **Node.js** v18+ (recommended: v20 LTS)
- **npm** v9+
- **AWS EC2 SSH Key** (`.pem` file) — required for the backend to push configs to the cloud

---

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/OmShimpi2802/Ozone_FY_Project.git
cd Ozone_FY_Project
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Setup the Backend Server

```bash
cd "Backend Server"
npm install
```

**Required:** Place your AWS EC2 SSH private key file as `Ozone_Otel_Keypair.pem` in the `Backend Server/` directory. This key is used by the server to push config updates to the EC2 instance via SSH.

> ⚠️ **Security Note:** The `.pem` file is excluded from Git via `.gitignore`. Never commit private keys to version control.

**Configure EC2 connection** (if needed): Edit `server.ts` and update these constants:
```typescript
const EC2_HOST = "18.209.6.119";   // Your EC2 public IP
const EC2_USER = "ubuntu";          // Your EC2 username
const EC2_KEY_PATH = path.join(__dirname, "Ozone_Otel_Keypair.pem");
const EC2_REMOTE_PATH = "/var/www/html/config.json";
```

### 4. Setup the Frontend Admin

```bash
cd "../Frontend Admin"
npm install
```

**Optional:** Create a `.env.local` file if needed:
```
GEMINI_API_KEY=YOUR_API_KEY_HERE
```

---

## ▶️ Running the Project

### Start the Backend Server

```bash
cd "Backend Server"
npx tsx server.ts
```

The backend will start on **http://localhost:8889**

### Start the Frontend Dashboard

```bash
cd "Frontend Admin"
npm run dev
```

The frontend will start on **http://localhost:5173** (default Vite port)

---

## 🔧 How It Works

1. **Admin** toggles a security policy (e.g., Block USB, Disable Copy) on the React dashboard.
2. **Frontend** sends a POST request to the backend at `/api/update-config`.
3. **Backend** writes the updated `config.json` locally and pushes it to the **AWS EC2** instance via SSH.
4. **Endpoint Agents** (`ContiDLPService`) on all managed PCs poll the EC2-hosted `config.json` every 5 seconds and enforce the new policies immediately.

### API Endpoints

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| GET    | `/api/config`         | Fetch the current configuration      |
| POST   | `/api/update-config`  | Update permissions and sync to EC2   |

---

## 📋 Available Policies

| Policy         | Config Key       | Description                                     |
|----------------|------------------|-------------------------------------------------|
| Copy           | `copy`           | Allow/Block clipboard copy operations           |
| Paste          | `paste`          | Allow/Block clipboard paste operations          |
| Screenshot     | `screenshot`     | Allow/Block PrintScreen key                     |
| File Download  | `file_download`  | Allow/Block file downloads                      |
| Print          | `print`          | Allow/Block printing from applications          |
| USB            | `usb`            | Allow/Block USB storage devices                 |
| Git Clone      | `git_clone`      | Allow/Block git clone operations                |
| Log Events     | `log_events`     | Enable/Disable security event logging           |
| Kill Switch    | `kill_switch`    | Emergency: disable all DLP enforcement          |
| Internet       | `internet`       | Allow/Block internet access for browsers/tools  |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite 6
- **Backend:** Express 5, TypeScript, node-ssh
- **Infrastructure:** AWS EC2 (Ubuntu), Nginx
- **Protocol:** REST API, SSH for config sync

---

## 📝 License

This project is part of the OZONE DLP Final Year Project.
