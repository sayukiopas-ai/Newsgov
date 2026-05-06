# Trello Clone

Kanban board web application

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

### 1. Backend (Server)

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev
```

Server runs on http://localhost:5000

### 2. Frontend (Client)

```bash
cd client
npm install
npm run dev
```

Client runs on http://localhost:3000

## Features

- ✅ Create/Edit/Delete Boards
- ✅ Create/Edit/Delete Lists
- ✅ Create/Edit/Delete Cards
- ✅ Drag & Drop cards between lists
- ✅ Drag & Drop to reorder lists
- ✅ Labels support

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS |
| Drag & Drop | @hello-pangea/dnd |
| State | Zustand |
| Backend | Express.js + TypeScript |
| Database | MongoDB + Mongoose |
