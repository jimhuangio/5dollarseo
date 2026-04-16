# Roadmap

## Phase Status

| Phase | Name | Status |
|---|---|---|
| 0 | Repo & Infrastructure | ✅ Complete |
| 1 | Account Code System | ✅ Complete |
| 2 | User Management & Admin Panel | ✅ Complete |
| 3 | SEO Tools — UI + API | ✅ Complete |
| 4 | Firebase Integration | 🔲 Next |
| 5 | Report Persistence & Viewer | 🔲 Next |
| 6 | Stripe Payments | 🔲 Pending |
| 7 | PDF Generation | 🔲 Pending |
| 8 | Production Deploy | 🔲 Pending |
| 9 | Post-Launch Enhancements | 🔲 Future |

---

## Phase 0 — Repo & Infrastructure ✅

- [x] GitHub repository created (`jimhuangio/5dollarseo`)
- [x] Next.js 14 with TypeScript, Tailwind, App Router
- [x] shadcn/ui component library initialized
- [x] Firebase Admin and client SDKs installed
- [x] Recharts and Cheerio installed
- [x] Vercel cron config (`vercel.json`)
- [x] Environment variable template (`.env.local.example`)
- [x] `.gitignore` configured — secrets never committed

---

## Phase 1 — Account Code System ✅

- [x] 14-character code generator with safe charset (27 chars)
- [x] Format/normalize/validate utilities
- [x] `POST /api/accounts/create` — generates new user account
- [x] `GET /api/accounts/[code]` — validates code, returns account + reports
- [x] Rate limiting on both endpoints
- [x] Timing-safe responses (no oracle attack surface)
- [x] HttpOnly cookie + localStorage dual persistence

---

## Phase 2 — User Management & Admin Panel ✅

- [x] 4-tier role system (user / elevated / admin / super_admin)
- [x] Admin seed endpoint (one-time super_admin bootstrap)
- [x] `POST/GET/DELETE /api/admin/users`
- [x] `POST/DELETE /api/admin/admins` (super_admin only)
- [x] `GET/DELETE /api/admin/reports`
- [x] `GET/DELETE /api/reports/[id]` (user soft-delete + admin hard-delete)
- [x] Firestore data model: accounts, reports, payments collections
- [x] Daily cron cleanup of expired reports

---

## Phase 3 — SEO Tools UI + API ✅

- [x] Tool selection page (`/tools`)
- [x] Credit confirmation dialog (inputs lock permanently after confirm)
- [x] All 4 tool pages with real API calls
- [x] DataForSEO client (keyword research, backlinks, SERP)
- [x] Bright Data client (page fetching for site audit)
- [x] Page analyzer (Cheerio-based HTML parsing)
- [x] Sitemap/robots.txt discovery (up to 50 pages)
- [x] DataForSEO Lighthouse integration (mobile + desktop)
- [x] CSV download working on all tools
- [x] Interactive in-browser results (charts, sortable tables, score rings)

---

## Phase 4 — Firebase Integration 🔲

**Goal:** Replace all mock data with real Firestore reads and writes.

- [ ] Create Firebase project (Firestore, Storage enabled)
- [ ] Fill in `.env.local` Firebase credentials
- [ ] Fill in Vercel environment variables (for deployment)
- [ ] Set Firestore security rules (code-based access, no public reads)
- [ ] Wire `useAccount()` hook into dashboard and tool pages
- [ ] Wire `useAccount()` into admin panel
- [ ] Test account creation → code entry → dashboard flow end-to-end

**Firestore Security Rules Sketch:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Accounts: readable only by the account holder (via code in request header)
    // Reports: readable by owner code, writable only by server (Admin SDK)
    // All writes go through Admin SDK — client SDK is read-only
  }
}
```

---

## Phase 5 — Report Persistence & Viewer 🔲

**Goal:** Reports are saved to Firestore after every tool run and viewable later.

- [ ] After tool run succeeds, call `createReport()` and store `resultJson`
- [ ] Deduct 1 credit from account (skip for elevated/admin)
- [ ] Store CSV as Firebase Storage file, generate signed URL
- [ ] Build `/dashboard/reports/[id]` — report viewer page
  - [ ] Keyword report: overview + chart + related keywords table (read-only)
  - [ ] Backlink report: overview + referring domains + top pages (read-only)
  - [ ] Site audit report: health summary + Lighthouse + pages table (read-only)
  - [ ] SERP report: ranked result cards (read-only)
- [ ] Download buttons pull from signed Storage URLs
- [ ] Handle `processing` status — polling or webhook when report is ready

---

## Phase 6 — Stripe Payments 🔲

**Goal:** Users can purchase credits. Revenue is real.

- [ ] Create Stripe account and products (1 credit / 5 credits / 12 credits)
- [ ] `POST /api/payments/checkout` — creates Stripe Checkout session with account code in metadata
- [ ] Stripe Checkout hosted page (redirect flow)
- [ ] `POST /api/payments/webhook` — receives `checkout.session.completed`, adds credits idempotently
- [ ] `/dashboard/credits` — credit purchase page with bundle options
- [ ] Payment record written to Firestore `payments` collection
- [ ] Success page after payment with credit balance updated
- [ ] Guard: tool pages check credit balance server-side before running

---

## Phase 7 — PDF Generation 🔲

**Goal:** Users can download professional PDF reports.

- [ ] Evaluate approach: `@react-pdf/renderer` (client-side) vs Puppeteer (server-side via Firebase Function)
- [ ] PDF template per tool type (cover page, data tables, charts as images)
- [ ] PDF stored in Firebase Storage alongside CSV
- [ ] Signed URL added to report document in Firestore
- [ ] Download PDF button pulls real URL

**Recommended approach:** Firebase Cloud Function triggered after report completion — Puppeteer renders the in-browser report page as a PDF. This avoids Vercel's 10-second function timeout for large sites.

---

## Phase 8 — Production Deploy 🔲

- [ ] Connect Vercel project to GitHub repo (auto-deploy on push to `main`)
- [ ] Add all environment variables to Vercel dashboard
- [ ] Configure custom domain (e.g. 5dollarseo.com)
- [ ] Set up Stripe webhook endpoint in Stripe dashboard pointing to production URL
- [ ] Enable Vercel cron in production (requires Vercel Pro or Hobby plan)
- [ ] Run end-to-end test: create account → buy credit → run tool → download report
- [ ] Add privacy policy page (required for Stripe)

---

## Phase 9 — Post-Launch Enhancements 🔲

See `IDEA-INBOX.md` for full list. Top candidates after launch:

| Feature | Impact | Effort |
|---|---|---|
| Domain Overview tool | High | Medium |
| Credit expiry (1 year) | Medium | Low |
| Referral program (share code = free credit) | High | Medium |
| Report sharing (public link) | Medium | Low |
| Bulk keyword research (multiple keywords, 1 credit) | High | Medium |
| Email receipt on purchase (optional) | Low | Low |
| API access tier (developers) | High | High |
