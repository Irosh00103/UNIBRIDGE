# UniBridge
Integrated Academic, Career & Peer Learning Platform

## Quick Start

### Backend
1. `cd server`
2. `npm install`
3. (update .env with your MongoDB URI if needed, currently defaults to a skeleton)
4. `npm run seed`
5. `npm run dev`

### Frontend
1. `cd client`
2. `npm install`
3. `npm start`

## Test Accounts
| Role | Email | Password |
| --- | --- | --- |
| Student | student@test.com | test123 |
| Employer | employer@test.com | test123 |
| Employer | employer@test.com | test123 |

## Demo Flow
- Login as student → browse materials → upload material → view jobs → apply to job → check my applications → create kuppi session
- Login as employer → view dashboard → post a new job → view applicants → select/reject applicants

## Features
- JWT authentication with role-based access control
- Lecture Materials: browse + upload via URL link
- Job System: employer posts jobs, students apply with CV link
- Kuppi Hub: peer study session creation and listing
- Full form validation on every form
- Fill Sample Data buttons for fast demo
- Pre-seeded test data
