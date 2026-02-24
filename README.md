# ShuleAI Backend System - Individual Schools

Complete school intelligence system designed for **individual schools** (primary or secondary). Built with Node.js, Express, PostgreSQL, and Sequelize ORM.

## 🏫 Supported School Types

### Primary Schools
- Pre-Primary (PP1, PP2)
- Lower Primary (Grades 1-3)
- Upper Primary (Grades 4-8)
- Features: Feeding programs, parent pickup, play-based learning

### Secondary Schools  
- Forms 1-4
- Subject specialization
- Boarding management
- Exam preparation (KCSE, IGCSE)

## 🚀 Features

- ✅ **Multi-role authentication** (Admin, Teacher, Parent, Student)
- ✅ **Individual school configuration** - Each school has its own settings
- ✅ **Teacher signup with School ID** - Secure onboarding
- ✅ **Admin approval workflow** - Approve/reject teacher applications
- ✅ **Automated duty management** - Fair duty distribution
- ✅ **Real-time chat** with WebSocket
- ✅ **CSV upload** for bulk student/marks/attendance
- ✅ **Fee management** with payment tracking
- ✅ **Academic records** with automatic grading
- ✅ **Attendance tracking** with reporting
- ✅ **Alert and notification system**
- ✅ **Automatic time synchronization** with NTP servers
- ✅ **PostgreSQL database** with Sequelize ORM

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 12.0
- npm >= 9.0.0

## 🛠️ Quick Start

```bash
# 1. Clone repository
git clone https://github.com/shuleai/shuleai-backend.git
cd shuleai-backend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your database connection string

# 4. Create database
createdb shuleai

# 5. Run migrations and seed
npm run seed

# 6. Start the server
npm run dev