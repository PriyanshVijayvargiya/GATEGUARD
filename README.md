# 🚧 GateGuard — ANPR Based Automated Society Gate Entry System

GateGuard is a smart automated gate entry system for housing societies/campuses that works on the concept of **Automatic Number Plate Recognition (ANPR/LPR)**.  
It reduces manual work at the gate by providing **vehicle registration, admin approval (whitelist), blocking (blacklist), and entry/exit logs**.

---

## 🎯 Problem Statement
In many societies and campuses, gate entry is managed manually by security guards, which leads to:
- Long waiting time at entry/exit
- Manual verification errors
- No proper record of vehicle movement
- Difficulty in managing unauthorized vehicles

GateGuard solves this by implementing a **digital vehicle registry + admin approval system** and supports automation through plate-based verification.

---

## ✅ Objectives
- Build a secure vehicle registration system for residents
- Implement admin approval before allowing gate access
- Maintain entry/exit logs for tracking and security
- Support blacklist functionality for blocked vehicles
- Provide a scalable architecture for ANPR + IoT gate automation

---

## 🚀 Key Features

### 👤 Resident/User Features
- Register/Login system
- Add vehicle using number plate
- Track vehicle status:
  - **Pending**
  - **Approved**
  - **Blocked**
- View activity/entry logs *(if enabled)*

### 🛡️ Admin Features
- Admin dashboard for complete control
- View all registered users and vehicles
- Approve / Reject vehicle registration requests
- Block vehicle plates instantly
- View gate entry/exit logs

### 🚪 Gate Automation (Future Integration)
- Plate verification API (for ANPR edge device)
- Can integrate with:
  - ANPR Camera
  - Raspberry Pi / Mini PC
  - Gate barrier relay controller

---

## 🧠 Tech Stack Used

### Frontend
- React (Vite)
- Tailwind CSS
- TypeScript

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- Drizzle ORM

### Tools / Platform
- Replit (Development)
- GitHub (Version Control)

---

## 🏗️ System Workflow (How It Works)
1. Resident registers and adds vehicle plate number
2. Vehicle request goes into **Pending** state
3. Admin reviews and **Approves / Rejects / Blocks** vehicle
4. Approved vehicles become a part of the whitelist
5. Gate verification checks plate access and stores entry/exit logs

---

## 🗄️ Database Design (PostgreSQL)
Main tables used in this project:
- `users` → stores residents/admin accounts
- `vehicles` → stores registered vehicle plates with approval status
- `gate_logs` → stores entry/exit activity logs
- `temporary_passes` *(optional/future)* → guest access system

---

## 📂 Project Structure
GATEGUARD/
│
├── client/ # Frontend (React + Tailwind)
├── server/ # Backend (Node.js + Express)
├── shared/ # Shared types/utilities
├── script/ # Scripts (if any)
├── attached_assets/
│
├── drizzle.config.ts
├── package.json
├── tsconfig.json
└── README.md

🔐 Admin Panel
The admin panel allows society admins/security team to:
Approve pending vehicles
Block suspicious or unauthorized plates
Monitor all gate activity logs
Admin access is controlled using user roles stored in the database.

🔮 Future Scope / Enhancements
Real ANPR integration (PlateRecognizer / OpenALPR)
Edge device setup using Raspberry Pi / Mini PC
Automatic barrier control using relay
Temporary visitor passes with expiry time
Realtime notifications for residents (Entry/Exit alerts)
Offline whitelist caching for no-internet mode
Multi-lane entry + exit support

👨‍💻 Developed By
Priyansh Vijayvargiya
Final Year Project — GateGuard 

This project is made for educational/final year purposes.


