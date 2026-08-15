# blog-frontend

Next.js (App Router) + TypeScript + Tailwind CSS frontend for the [blog-backend](https://github.com/khanasfahankhan-sys/blog-backend) API.

## Setup

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to the backend URL
npm run dev
```

## Pages

- `/` — public feed of published posts, with debounced search and tag filtering via URL query params
- `/blog/[slug]` — public single post view with rendered markdown
- `/login`, `/register` — JWT auth (token stored in localStorage, sent as `Authorization: Bearer`)
- `/dashboard` — list my posts (unauthenticated users are redirected to `/login`)
- `/dashboard/new` — create a post with live markdown preview
- `/dashboard/edit/[id]` — edit a post (the URL param is the post slug, which the backend API uses as the identifier)
