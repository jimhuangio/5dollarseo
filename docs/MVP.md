# MVP — Minimum Viable Product

## MVP Definition

The MVP is the smallest version of the product that can be sold to a paying customer. For $5 SEO, the MVP requires:

1. A user can create an account code
2. A user can purchase at least one credit
3. A user can run at least one SEO tool
4. The report is saved and downloadable
5. The user can return later and find their report

Everything else is an enhancement.

---

## Completed Features Checklist

### Account System
- [x] **14-character account code generation** — Cryptographically random, safe charset, no confusable glyphs
- [x] **Code entry on landing page** — Auto-formats with dashes as user types (XXXX-XXXXX-XXXXX)
- [x] **New account creation** — Single click, code shown with copy button
- [x] **Code stored in browser** — localStorage + HttpOnly cookie for session persistence
- [x] **Rate limiting on code lookup** — 5 failed attempts per IP per 15 minutes (brute force protection)
- [x] **Rate limiting on account creation** — 3 new accounts per IP per hour (spam protection)
- [x] **Timing-safe invalid code response** — Returns same error for invalid format and wrong code (prevents oracle attacks)

### User Roles
- [x] **4-tier role system** — `user`, `elevated` (unlimited credits for testing), `admin`, `super_admin`
- [x] **Elevated users bypass credit deduction** — For internal testing without spending real money
- [x] **Admin panel access control** — Only `admin` and `super_admin` can see admin panel
- [x] **Admin management** — Only `super_admin` can create or delete admin accounts
- [x] **Super admin seed endpoint** — One-time setup route to create the first super_admin (env-gated)

### Report System
- [x] **Firestore data model** — `accounts`, `reports`, `payments` collections defined
- [x] **60-day report retention** — `expiresAt` field set on every report
- [x] **Soft delete by user** — Hides report from dashboard but retains it for admin
- [x] **Hard delete by admin** — Permanently removes report (marks `hardDeletedAt`)
- [x] **Daily cleanup cron** — Vercel cron at 3am UTC purges expired reports from Storage
- [x] **Admin retains access forever** — Admin sees all reports including user-deleted ones

### SEO Tools — UI
- [x] **Tool selection page** (`/tools`) — 4 tools with descriptions, time estimates, credit cost
- [x] **Credit confirmation dialog** — "This costs 1 credit ($5), inputs locked after confirm" modal before every run
- [x] **Locked input display** — After confirmation, form inputs shown as read-only badges
- [x] **Loading state** — Spinner with tool-specific message during API call
- [x] **Error state** — Friendly error with "Try again" link on API failure
- [x] **CSV download** — Client-side CSV generation working on all 4 tools
- [x] **PDF download stub** — Button present, returns message until backend PDF generation is wired

### Keyword Research Tool
- [x] **Form** — Keyword input, location selector (US/UK/CA/AU), language selector (EN/ES/FR/DE)
- [x] **API route** — `POST /api/tools/keyword-research` calls DataForSEO
- [x] **Overview stats** — Search volume, CPC, keyword difficulty, intent badge
- [x] **12-month trend chart** — Line chart using Recharts
- [x] **Related keywords table** — 10 keywords, sortable by volume/CPC/difficulty, difficulty bar, intent badge

### Backlink Checker Tool
- [x] **Form** — Domain input
- [x] **API route** — `POST /api/tools/backlink-checker` calls DataForSEO
- [x] **Overview stats** — Total backlinks, referring domains, new/lost (30 days)
- [x] **Referring domains table** — Domain, backlink count, domain rating bar, first seen date
- [x] **Top pages table** — URL path, backlinks, referring domains

### Site Audit Tool
- [x] **Form** — URL input with https:// normalization
- [x] **API route** — `POST /api/tools/site-audit` — sitemap discovery + Bright Data crawl + Cheerio analysis + DataForSEO Lighthouse
- [x] **Sitemap discovery** — Reads robots.txt, follows sitemap index up to 3 levels, crawls up to 50 pages
- [x] **Page analysis** — Title, description, canonical, H1–H6 counts, word count, internal/external links, structured data detection
- [x] **Issue detection** — Missing title, short title, missing description, missing H1, multiple H1s, missing canonical, low word count
- [x] **Health score** — Calculated from issue density across all pages
- [x] **Lighthouse scores** — Performance, LCP, CLS, INP, TTFB for mobile and desktop
- [x] **Pages table** — Status code badge, title length, H1 count, word count, issue badges

### SERP Analysis Tool
- [x] **Form** — Keyword, location, device (desktop/mobile)
- [x] **API route** — `POST /api/tools/serp-analysis` calls DataForSEO live organic
- [x] **Results** — Ranked cards with position number, domain, title, URL, description

### Dashboard
- [x] **Credit balance display** — Shows numeric balance or ∞ for elevated/admin roles
- [x] **Role badge** — Standard / Beta Tester / Admin / Super Admin
- [x] **Report list** — Tool type, status badge, created date, expiry countdown, credits charged
- [x] **Expiry warning** — Expiry shown in red when fewer than 7 days remain
- [x] **Soft delete from dashboard** — Confirmation dialog before hiding report
- [x] **Run a tool button** — Links to `/tools`, disabled if zero credits
- [x] **Account code display** — Formatted code shown in header
- [x] **Sign out** — Clears localStorage and cookie, redirects to landing

### Admin Panel
- [x] **Users tab** — All accounts with role, credit balance, last active, delete button
- [x] **Reports tab** — All reports including soft-deleted, with hard-delete action
- [x] **Admins tab** — Visible to super_admin only, create/delete admin codes
- [x] **Create elevated user** — Admin can create beta tester accounts
- [x] **Self-deletion guard** — Cannot delete your own account

### Infrastructure
- [x] **Firebase Admin lazy initialization** — Does not crash build when env vars missing
- [x] **Vercel cron config** — `vercel.json` with daily 3am cleanup job
- [x] **Environment variable template** — `.env.local.example` with all required variables
- [x] **GitHub repository** — `jimhuangio/5dollarseo`, main branch protected
- [x] **Production build passing** — `npm run build` succeeds with 21 routes, zero TypeScript errors

---

## Pending Features (Required for Launch)

### P0 — Blocking Launch

| Feature | Why It Blocks Launch |
|---|---|
| **Firebase setup** | No data persists without it. Mock data only. |
| **Stripe payments** | No way to purchase credits |
| **Report persistence** | Reports currently not saved to Firestore after tool runs |
| **Credit deduction on tool run** | Credits not actually deducted yet (mock account used) |
| **Real account session** | `useAccount()` hook not wired to dashboard/tools — mock data used |

### P1 — Required Before Charging Users

| Feature | Why It Matters |
|---|---|
| **PDF report generation** | Promised in UI, stub only |
| **Report viewer** (`/dashboard/reports/[id]`) | Users cannot revisit past reports in-browser |
| **Credit balance guards on tool pages** | Users with 0 credits can still navigate to tool pages |
| **Stripe webhook credit top-up** | Credits never actually added after payment |

### P2 — Quality of Life Before Public Launch

| Feature | Why It Matters |
|---|---|
| **Email receipt (optional)** | Users may want payment confirmation even without an account email |
| **Vercel deployment** | App not yet deployed to production URL |
| **Custom domain** | 5dollarseo.com or similar |
| **Privacy policy page** | Required for Stripe and any public-facing product |
