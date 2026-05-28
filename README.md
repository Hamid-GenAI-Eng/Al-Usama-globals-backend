<div align="center">

# Al Usama Globals — Backend API

**Node.js REST API · Prisma ORM · Vercel Serverless**

[![Live API](https://img.shields.io/badge/Live%20API-al--usama--globals--backend.vercel.app-black?style=flat-square&logo=vercel)](https://al-usama-globals-backend.vercel.app)
[![JavaScript](https://img.shields.io/badge/JavaScript-100%25-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

</div>

---

## Overview

This is the backend API powering the [Al Usama Globals](https://al-usama-global.vercel.app) platform. Built as a serverless Node.js application deployed on Vercel, it uses **Prisma ORM** for type-safe database access with schema-driven migrations. Includes a dedicated test suite for validating database connectivity, individual endpoints, and full API flows.

🔗 **API Base URL:** [al-usama-globals-backend.vercel.app](https://al-usama-globals-backend.vercel.app)  
🖥️ **Frontend Repo:** [al-usama-globals](https://github.com/Hamid-GenAI-Eng/al-usama-globals)

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Language** | JavaScript (100%) |
| **ORM** | Prisma |
| **Deployment** | Vercel (Serverless Functions) |
| **CI/CD** | Vercel auto-deploy from `main` |

---

## Project Structure

**Al-Usama-globals-backend/**
├── **api**/                    # Serverless API route handlers
├── **src**/                    # Core business logic
├── **prisma**/
│   ├── **schema.prisma**       # Database schema
│   └── **migrations**/         # Migration history
├── **test_db_connection.js**   # DB connectivity test
├── **test_apis.js**            # Individual endpoint tests
├── **test_all_apis.js**        # Full API test suite
├── **test_user_string.js**     # User string validation tests
├── **test_output.txt**         # Local test results
├── **vercel_test_output.txt**  # Vercel deployment test results
├── **vercel.json**             # Vercel config
└── **package.json**

---

## Getting Started

### Prerequisites

- Node.js 18+
- A supported database (PostgreSQL recommended with Prisma)
- Vercel CLI (for local dev): `npm i -g vercel`

### Installation

```bash
git clone https://github.com/Hamid-GenAI-Eng/Al-Usama-globals-backend.git
cd Al-Usama-globals-backend
npm install
```

### Environment Setup

Create a `.env` file in the root:

```env
DATABASE_URL="your-database-connection-string"
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio
npx prisma studio
```

### Run Locally

```bash
vercel dev
```

Server starts at `http://localhost:3000`

---

## Testing

This project ships with dedicated test scripts for every layer of the stack:

```bash
# Test database connection
node test_db_connection.js

# Test individual API endpoints
node test_apis.js

# Run the full API test suite
node test_all_apis.js

# Test user string handling
node test_user_string.js
```

Test outputs are saved to `test_output.txt` and `vercel_test_output.txt` for review.

---

## Deployment

Deployed on **Vercel** with serverless functions. Every push to `main` triggers an automatic deployment.

Routing is configured via `vercel.json` to map API paths to the correct serverless handlers.

```bash
# Deploy manually
vercel --prod
```

---

## Related

- 🖥️ **Frontend:** [al-usama-globals](https://github.com/Hamid-GenAI-Eng/al-usama-globals) — React 18 + TypeScript + Shadcn/ui
- 🌐 **Live App:** [al-usama-global.vercel.app](https://al-usama-global.works)

---

## Built By

**Hamid Saifullah** — Tech Lead at [Code Envision Technologies](https://codeenvisiontechnologies.com)

[![GitHub](https://img.shields.io/badge/GitHub-Hamid--GenAI--Eng-181717?style=flat-square&logo=github)](https://github.com/Hamid-GenAI-Eng)
[![Portfolio](https://img.shields.io/badge/Portfolio-hamid--saifullah-black?style=flat-square&logo=vercel)](https://hamid-saifullah-portfolio-nexus.vercel.app)
