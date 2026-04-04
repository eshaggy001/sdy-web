# Admin Dashboard — Information Architecture Map

## Overview

SDY Admin Dashboard нь **React 19 + Vite + TypeScript** дээр суурилсан, Supabase backend-тэй, MN/EN хоёр хэлний дэмжлэгтэй удирдлагын самбар юм.

---

## Route бүтэц

Бүх admin route-ууд `/:lang/admin/*` prefix-тэй (жнь: `/mn/admin/programs`).

```
/:lang/admin
│
├── Auth (layout-гүй)
│   ├── /login
│   ├── /forgot-password
│   └── /reset-password
│
├── Dashboard (/)
│
├── Programs (/programs)              [Editor+]
│   └── Edit (/programs/:id)
│       ├── Details tab (form)
│       └── Registrations tab (stats + table + approve/reject/delete)
│
├── Events (/events)                  [Editor+]
│   └── Edit (/events/:id)
│       ├── Details tab (form)
│       └── Registrations tab (stats + table + approve/reject/delete)
│
├── News (/news)                      [Editor+]
│   └── Edit (/news/:id)
│
├── Leaders (/leaders)                [Editor+]
│   └── Edit (/leaders/:id)
│
├── Pillars (/pillars)                [Editor+]
│   └── Edit (/pillars/:id)
│
├── Stats (/stats)                    [Editor+]
│   └── Edit (/stats/:id)
│
├── Polls (/polls)                    [Editor+]
│   └── Edit (/polls/:id)
│
├── Submissions (/submissions)        [Admin Only]
│
└── Users (/users)                    [Admin Only]
```

---

## Section тус бүрийн дэлгэрэнгүй

### Auth (Layout-гүй)

| Route | Тайлбар |
|---|---|
| `/admin/login` | Нэвтрэх хуудас |
| `/admin/forgot-password` | Нууц үг сэргээх хүсэлт |
| `/admin/reset-password` | Нууц үг шинэчлэх |

---

### Dashboard (`/admin`)

Ерөнхий тойм хуудас:
- KPI тоонууд (гишүүд, хөтөлбөрүүд, мэдээ, саналын хуудас)
- Өсөлтийн trend график
- Бүсчилсэн тархалтын газрын зураг (Mongolia dot-grid map)

---

### Programs (`/admin/programs`) — Editor+

**List хуудас:**
- Бүх хөтөлбөрүүдийн жагсаалт (status, capacity, бүртгэлийн тоо)
- Үйлдлүүд: Шинэ үүсгэх, Засах, Устгах, Refresh

**Edit хуудас** (`/admin/programs/:id` — `id=new` бол шинэ үүсгэх):

*Tab 1: Мэдээлэл (Details)* — Form fields:

| Field | Төрөл | Хэл |
|---|---|---|
| Title | Text | MN/EN |
| Status | Text | MN/EN |
| Description | Textarea | MN/EN |
| Content | Rich text | MN/EN |
| Pillar | Select | - |
| Date | Date picker | - |
| Location | Text | - |
| Capacity | Number | - |
| Deadline | Date picker | - |
| Image | Upload | - |
| Max Participants | Number | - |
| Registration Toggle | Switch | - |
| Highlights | Multi-row editable | MN/EN |

*Tab 2: Бүртгэлүүд (Registrations)* — Тухайн хөтөлбөрийн бүртгэлүүд:
- Stats: Нийт / Хүлээгдэж буй / Зөвшөөрсөн / Татгалзсан
- Хүснэгт: Нэр, Холбоо барих, Огноо, Төлөв, Үйлдэл (Approve/Reject/Delete)

---

### Events (`/admin/events`) — Editor+

**List хуудас:**
- Status filter: All / Draft / Published / Ongoing / Completed / Cancelled
- Үйлдлүүд: Шинэ үүсгэх, Засах, Устгах, Refresh

**Edit хуудас** (`/admin/events/:id`):

*Tab 1: Мэдээлэл (Details)* — Form fields:

| Field | Төрөл | Хэл |
|---|---|---|
| Title | Text | MN/EN |
| Status | Select | - |
| Description | Textarea | MN/EN |
| Content | Rich text | MN/EN |
| Date Start | Date picker | - |
| Date End | Date picker | - |
| Image | Upload | - |
| Max Participants | Number | - |

*Tab 2: Бүртгэлүүд (Registrations)* — Тухайн арга хэмжээний бүртгэлүүд:
- Stats: Нийт / Хүлээгдэж буй / Зөвшөөрсөн / Татгалзсан
- Хүснэгт: Нэр, Холбоо барих, Огноо, Төлөв, Үйлдэл (Approve/Reject/Delete)

---

### News (`/admin/news`) — Editor+

**List хуудас:**
- Мэдээний жагсаалт (категори, огноо)
- Үйлдлүүд: Шинэ үүсгэх, Засах, Устгах, Refresh

**Edit хуудас** (`/admin/news/:id`):

| Field | Төрөл | Хэл |
|---|---|---|
| Title | Text | MN/EN |
| Category | Text | MN/EN |
| Date | Text | MN/EN |
| Excerpt | Textarea | MN/EN |
| Content | Rich text | MN/EN |
| Image | Upload | - |

---

### Leaders (`/admin/leaders`) — Editor+

**List хуудас:**
- Удирдагчдын жагсаалт (role, sort order)
- Drag-and-drop дарааллын өөрчлөлт
- Үйлдлүүд: Шинэ үүсгэх, Засах, Устгах

**Edit хуудас** (`/admin/leaders/:id`):

| Field | Төрөл | Хэл |
|---|---|---|
| Name | Text | MN/EN |
| Role | Text | MN/EN |
| Image | Upload | - |
| Sort Order | Number | - |

---

### Pillars (`/admin/pillars`) — Editor+

**List хуудас:**
- Тулгуур чиглэлүүдийн жагсаалт (icon, sort order)
- Үйлдлүүд: Шинэ үүсгэх, Засах, Устгах

**Edit хуудас** (`/admin/pillars/:id`):

| Field | Төрөл | Хэл |
|---|---|---|
| Title | Text | MN/EN |
| Icon Name | Text | - |
| Href | Text | - |
| Sort Order | Number | - |

---

### Stats (`/admin/stats`) — Editor+

**List хуудас:**
- Статистик тоонуудын жагсаалт (value, icon)
- Үйлдлүүд: Шинэ үүсгэх, Засах, Устгах

**Edit хуудас** (`/admin/stats/:id`):

| Field | Төрөл | Хэл |
|---|---|---|
| Label | Text | MN/EN |
| Value | Text | - |
| Icon Name | Text | - |
| Sort Order | Number | - |

---

### Polls (`/admin/polls`) — Editor+

**List хуудас:**
- Саналын хуудсуудын жагсаалт (status: Draft/Published)
- Үйлдлүүд: Шинэ үүсгэх, Засах, Устгах, Харагдах байдал солих, Үр дүн харах

**Edit хуудас** (`/admin/polls/:id`):

| Field | Төрөл | Хэл |
|---|---|---|
| Question | Text | MN/EN |
| Options | Multi-row | MN/EN |
| Status | Select | - |
| Active Toggle | Switch | - |

---

### Submissions (`/admin/submissions`) — Admin Only

**Tab 1: Гишүүнчлэлийн өргөдлүүд**
- Fields: Нэр, Имэйл, Нас, Байршил, Утас, Огноо
- Статус: Pending / Approved / Rejected
- Үйлдлүүд: Зөвшөөрөх, Татгалзах, Устгах

**Tab 2: Холбоо барих мессежүүд**
- Fields: Нэр, Имэйл, Гарчиг, Мессеж, Огноо
- Үйлдлүүд: Статус өөрчлөх, Устгах

---

### Users (`/admin/users`) — Admin Only

- Админ хэрэглэгчдийн жагсаалт (email, role, status, огноо)
- Үйлдлүүд:
  - **Шинэ хэрэглэгч урих** (modal) — Email, Role (Admin/Editor)
  - **Role засах** (modal) — Role (Admin/Editor)

---

## Access Control

| Role | Хандах боломжтой section-ууд |
|---|---|
| **Editor** | Dashboard, Programs, Events, News, Leaders, Pillars, Stats, Polls |
| **Admin** | Дээрх бүгд + Submissions, Users |

---

## Ерөнхий загварууд (Common Patterns)

### List хуудас
- Loading indicator-тэй серверээс мэдээлэл татах
- CRUD үйлдлүүд (Create, Read, Update, Delete)
- Устгахдаа баталгаажуулалт (confirmation dialog)
- Үйлдлийн дараа жагсаалт автоматаар refresh

### Edit хуудас
- Route: `/:resource/:id` (`id = 'new'` → шинэ үүсгэх, бусад → засах)
- Layout: 2 багана (Үндсэн контент + Sticky sidebar — Save/Cancel товч)
- MN/EN хэлний хуваагч бүхий хоёр хэлний form
- Зураг upload (storageService)
- Хадгалаагүй өөрчлөлтийн анхааруулга (dirty state tracking)

### Data layer
- **Supabase** — Programs, Events, News, Leaders, Pillars, Stats, Registrations, Submissions, Users
- **localStorage** — Polls (`sdy_polls`, `sdy_user_votes`)
- **storageService** — Зураг upload/удирдлага

---

## Навигацийн бүтэц (Sidebar)

```
Sidebar
├── Dashboard
├── ─────────── (хуваагч)
├── Programs
├── Events
├── News
├── Leaders
├── Pillars
├── Stats
├── Polls
├── ─────────── (хуваагч)
├── Submissions      [Admin Only]
└── Users            [Admin Only]
```
