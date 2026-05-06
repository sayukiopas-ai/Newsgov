# Trello Clone - Project Specification

## Overview
แอปจัดการโปรเจกต์แบบ Kanban Board คล้าย Trello

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Drag & Drop**: @hello-pangea/dnd
- **State**: Zustand
- **Backend**: Express.js + TypeScript
- **Database**: MongoDB + Mongoose

## Data Models

### Board
```typescript
{
  _id: ObjectId,
  title: string,
  description?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### List
```typescript
{
  _id: ObjectId,
  boardId: ObjectId,
  title: string,
  position: number, // สำหรับเรียงลำดับ
  createdAt: Date,
  updatedAt: Date
}
```

### Card
```typescript
{
  _id: ObjectId,
  listId: ObjectId,
  title: string,
  description?: string,
  position: number,
  labels?: string[],
  dueDate?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Boards
- `GET /api/boards` - ดึง boards ทั้งหมด
- `GET /api/boards/:id` - ดึง board พร้อม lists และ cards
- `POST /api/boards` - สร้าง board ใหม่
- `PUT /api/boards/:id` - แก้ไข board
- `DELETE /api/boards/:id` - ลบ board

### Lists
- `POST /api/lists` - สร้าง list ใหม่
- `PUT /api/lists/:id` - แก้ไข list
- `DELETE /api/lists/:id` - ลบ list
- `PUT /api/lists/:id/position` - อัพเดทตำแหน่ง list

### Cards
- `POST /api/cards` - สร้าง card ใหม่
- `PUT /api/cards/:id` - แก้ไข card
- `DELETE /api/cards/:id` - ลบ card
- `PUT /api/cards/:id/position` - อัพเดทตำแหน่ง + listId (เมื่อลากไป list อื่น)

## Frontend Structure
```
client/
├── app/
│   ├── page.tsx              # Homepage - แสดง board list
│   ├── board/[id]/page.tsx   # Board detail - Kanban board
│   └── layout.tsx
├── components/
│   ├── BoardList.tsx         # แสดงรายการ boards
│   ├── KanbanBoard.tsx      # Main board component
│   ├── KanbanColumn.tsx     # List column
│   ├── KanbanCard.tsx       # Card component
│   ├── CreateBoardModal.tsx
│   ├── CreateListModal.tsx
│   ├── CreateCardModal.tsx
│   └── EditCardModal.tsx
├── store/
│   └── boardStore.ts        # Zustand store
├── types/
│   └── index.ts
└── lib/
    └── api.ts               # API client
```

## Backend Structure
```
server/
├── src/
│   ├── models/
│   │   ├── Board.ts
│   │   ├── List.ts
│   │   └── Card.ts
│   ├── routes/
│   │   ├── boardRoutes.ts
│   │   ├── listRoutes.ts
│   │   └── cardRoutes.ts
│   ├── controllers/
│   │   ├── boardController.ts
│   │   ├── listController.ts
│   │   └── cardController.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Features (MVP)
1. ✅ สร้าง/แก้ไข/ลบ Board
2. ✅ สร้าง/แก้ไข/ลบ List
3. ✅ สร้าง/แก้ไข/ลบ Card
4. ✅ Drag & Drop card ระหว่าง lists
5. ✅ Drag & Drop สลับตำแหน่ง lists
6. ✅ แสดง boards ทั้งหมด

## Future Features
- [ ] Authentication
- [ ] Labels/Tags
- [ ] Due Date
- [ ] Real-time collaboration
- [ ] Comments
