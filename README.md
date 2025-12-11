# CRM_E2X

Production-ready Mini CRM built with Next.js 14, TypeScript, Tailwind CSS, Supabase, and Chart.js.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Go to SQL Editor and run the SQL from `supabase-setup.sql`
3. **Create Admin User:**
   - Go to **Authentication > Users** in Supabase Dashboard
   - Click **"Add user"** or **"Invite user"**
   - Enter your admin email (e.g., `admin@example.com`)
   - Enter a password (minimum 6 characters)
   - Click **"Create user"**
   - **Note:** You can also use "Add user" and manually set email/password
4. Copy your Supabase URL and Anon Key from **Settings > API**

**Login Credentials:**
- Use the email and password you created in step 3
- Default login page: `/login`

### 3. Environment Variables

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Features

- ✅ Email + Password Authentication (Admin only)
- ✅ Dashboard with metrics and charts
- ✅ Leads Management (CRUD, Status tracking, Convert to customer)
- ✅ Customers Management (CRUD, Payment status)
- ✅ Offers Management (Linked to leads)
- ✅ Notes/Todos (Due dates, Related to leads/customers)
- ✅ Settings (Change password)
- ✅ Fully Responsive Design
- ✅ Row Level Security (RLS) enabled

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Chart.js
# crm_e2x
# crm_e2x
