# Architecture & Technical Decisions

## System Diagram

```
Browser (Next.js Client)
        │
        ▼
Vercel Edge (Next.js App Router)
        │
        ├── /api/accounts/*     ← Account management (Firebase Admin)
        ├── /api/admin/*        ← Admin operations (Firebase Admin)
        ├── /api/tools/*        ← SEO tool runners
        │       ├── DataForSEO API (keyword, backlinks, SERP, Lighthouse)
        │       └── Bright Data API (page fetching for site audit)
        ├── /api/payments/*     ← Stripe Checkout + webhook
        └── /api/cron/cleanup   ← Daily report expiry cleanup
                │
                ▼
        Firebase Firestore      ← Primary database
        Firebase Storage        ← Report files (CSV, PDF)
```

---

## Decision Log

### Why Next.js App Router (not Pages Router)?

- Server Components allow database reads without exposing credentials to the client
- API Routes are colocated with the frontend — one repo, one deploy
- Vercel is the natural hosting target and has deep Next.js integration
- App Router supports async server functions natively, matching our auth pattern

### Why Firebase (not Supabase, PlanetScale, or a traditional SQL database)?

- **No schema migrations** — Firestore is schemaless. We can add fields to documents without running migrations. Important for a fast-moving early product.
- **Real-time capable** — If we add live report status updates later, Firestore subscriptions are already there
- **Firebase Storage is colocated** — CSV and PDF files live in the same Firebase project as the data. One auth system, one dashboard
- **Free tier is generous** — 50,000 reads and 20,000 writes per day on Spark plan before any cost

**Trade-off accepted:** Firestore's NoSQL model makes complex queries harder. We work around this by keeping queries simple — accounts are looked up by code (document ID), reports are filtered by `accountCode`. No joins needed.

### Why no email or password login?

- Every email/password system requires: email verification, password reset flow, forgot password, breach detection, and GDPR handling
- Our target user runs one report and leaves. They do not want to manage another account
- Mullvad VPN proved this model works commercially — users accept code-based auth when the value proposition is clear
- No email = no PII collected = dramatically simpler privacy compliance

**Risk accepted:** Users who lose their code lose access. We mitigate this by:
1. Showing the code prominently on creation and prompting to copy it
2. Storing the code in localStorage (survives browser restarts, not device wipes)
3. Storing the code in an HttpOnly cookie (survives page refreshes)

### Why 14-character codes (not 16 or 18)?

With a 27-character safe charset:
- 27^14 ≈ 10^20 possible codes
- With 10,000 active users and 14.4M guesses/day from 1,000 IPs: ~6 million years to find one valid code
- 14 characters fits cleanly in the format `XXXX-XXXXX-XXXXX`
- 16 or 18 characters add no practical security given rate limiting, but hurt usability

### Why DataForSEO (not Semrush API, Ahrefs API, or Moz)?

| Provider | Model | Cost per call |
|---|---|---|
| DataForSEO | Pay-as-you-go | $0.02–$0.06 |
| Semrush API | Units-based | ~$0.20–$0.40 |
| Ahrefs API | Credits | ~$0.50–$2.00 |
| Moz API | Subscription | Flat monthly |

DataForSEO is the only provider with true pay-as-you-go pricing at the call level. At $5/credit and $0.10–$0.30/report API cost, margin is strong. Reference implementation from `github.com/every-app/open-seo` confirmed API shape and cost model.

### Why Bright Data for site audit crawling?

Site audits require fetching real page HTML. Direct fetching from Vercel serverless functions gets blocked by Cloudflare, bot detection, and geo-restrictions. Bright Data's residential proxy network bypasses these reliably.

Alternative considered: Direct fetch from Vercel. Rejected because too many modern sites block datacenter IPs.

### Why in-memory rate limiting (not Redis/Upstash)?

Vercel serverless functions spin up per-request — in-memory state does not persist between invocations. However:
- Each function instance maintains its own counter
- At our early scale, this provides meaningful friction without infrastructure overhead
- The real protection is Firestore — even if rate limiting is bypassed, creating fake accounts costs nothing to us and gains the attacker nothing (no credits without payment)

**Upgrade path:** Swap `src/lib/rate-limit.ts` store for Upstash Redis client in one file when scale requires it.

### Why Stripe (not Paddle, LemonSqueezy, or direct crypto)?

- Stripe is the industry standard. Every developer knows how to debug it
- Stripe Checkout handles all PCI compliance — we never touch card numbers
- Webhook-based credit top-up is idempotent (safe to receive duplicate events)
- Stripe's metadata field lets us attach the account code to a payment without storing user data

### Why Vercel Cron (not a Firebase Cloud Function scheduler)?

- We are already on Vercel. Adding a Firebase Cloud Function for cron adds a second infrastructure system to maintain
- Vercel cron hits our existing `/api/cron/cleanup` route — same code, same logs, same deploy
- `vercel.json` cron definition is in the repo — infrastructure as code

**Limitation:** Vercel cron requires Hobby plan or above. Fallback: manually call the cleanup endpoint or use a free external cron service (cron-job.org) to hit the URL.

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing — code entry + account creation
│   ├── dashboard/
│   │   └── page.tsx                # User dashboard — credits + report list
│   ├── tools/
│   │   ├── page.tsx                # Tool selection index
│   │   ├── keyword-research/page.tsx
│   │   ├── backlink-checker/page.tsx
│   │   ├── site-audit/page.tsx
│   │   └── serp-analysis/page.tsx
│   ├── admin/
│   │   └── page.tsx                # Admin panel — users / reports / admins tabs
│   └── api/
│       ├── accounts/
│       │   ├── create/route.ts     # POST — generate new account code
│       │   └── [code]/route.ts     # GET — validate code, return account data
│       ├── admin/
│       │   ├── seed/route.ts       # POST — create first super_admin (env-gated)
│       │   ├── users/route.ts      # GET/POST/DELETE — user management
│       │   ├── admins/route.ts     # POST/DELETE — admin management (super_admin only)
│       │   └── reports/route.ts    # GET/DELETE — admin report management
│       ├── reports/
│       │   └── [id]/route.ts       # GET — view report | DELETE — soft delete
│       ├── tools/
│       │   ├── keyword-research/route.ts
│       │   ├── backlink-checker/route.ts
│       │   ├── site-audit/route.ts
│       │   └── serp-analysis/route.ts
│       └── cron/
│           └── cleanup/route.ts    # GET — daily report expiry cleanup
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   ├── layout/
│   │   └── ToolPageLayout.tsx      # Shared tool page wrapper
│   ├── landing/
│   │   └── CodeEntry.tsx           # Code input + account creation form
│   ├── dashboard/
│   │   ├── CreditBalance.tsx       # Credit display + buy button
│   │   └── ReportList.tsx          # Report table with delete/view
│   └── tools/
│       ├── CreditConfirmDialog.tsx # "Use 1 credit?" modal
│       ├── LockedInputBadge.tsx    # Read-only input display after submit
│       ├── ReportDownloadBar.tsx   # CSV + PDF download buttons
│       ├── keyword-research/
│       │   ├── KeywordOverview.tsx # Stats + Recharts trend line
│       │   └── RelatedKeywordsTable.tsx
│       ├── backlink-checker/
│       │   └── BacklinkOverview.tsx
│       ├── site-audit/
│       │   └── SiteAuditOverview.tsx
│       └── serp-analysis/
│           └── SerpResults.tsx
├── hooks/
│   └── useAccount.ts               # Client-side account state + API calls
├── lib/
│   ├── accounts.ts                 # Firestore account CRUD
│   ├── reports.ts                  # Firestore report CRUD
│   ├── auth.ts                     # Cookie session + role guards
│   ├── code-generator.ts           # 14-char code gen + format/normalize
│   ├── rate-limit.ts               # In-memory rate limiter
│   ├── firebase-admin.ts           # Admin SDK (lazy init)
│   ├── firebase-client.ts          # Client SDK
│   ├── dataforseo.ts               # DataForSEO API client
│   ├── brightdata.ts               # Bright Data page fetcher
│   ├── page-analyzer.ts            # Cheerio HTML analysis
│   ├── sitemap-discovery.ts        # Robots.txt + sitemap crawler
│   └── mock-data.ts                # Static data for UI development
├── types/
│   └── index.ts                    # All shared TypeScript types
docs/
├── PROJECT-OVERVIEW.md
├── MVP.md
├── ROADMAP.md
├── ARCHITECTURE.md                 # This file
├── IDEA-INBOX.md
├── DEVELOPMENT-WORKFLOW.md
└── CUSTOMER-COMMUNICATION.md
```

---

## Data Model

### `accounts/{code}`
```
{
  role: "user" | "elevated" | "admin" | "super_admin"
  credits: number
  createdAt: Timestamp
  lastUsedAt: Timestamp
  createdBy: string | null   // code of the admin who created this account
}
```

### `reports/{reportId}`
```
{
  accountCode: string
  toolType: "keyword_research" | "site_audit" | "backlink_checker" | "serp_analysis"
  status: "pending" | "processing" | "complete" | "failed"
  inputParams: map            // what the user submitted
  resultJson: map | null      // full result for in-browser view
  resultCsvUrl: string | null // signed Firebase Storage URL
  resultPdfUrl: string | null // signed Firebase Storage URL
  creditsCharged: number      // 0 for elevated/admin
  createdAt: Timestamp
  expiresAt: Timestamp        // createdAt + 60 days
  deletedByUser: boolean
  deletedByUserAt: Timestamp | null
  hardDeletedAt: Timestamp | null
}
```

### `payments/{paymentId}`
```
{
  accountCode: string
  stripeSessionId: string
  creditsAdded: number
  amountPaid: number
  createdAt: Timestamp
  processed: boolean          // idempotency guard — only add credits once
}
```

---

## Security Model

| Threat | Mitigation |
|---|---|
| Code brute force | Rate limiting (5/15min per IP) + timing-safe responses + 10^20 code space |
| Credential leak | All secrets in env vars, never in code or git |
| Stripe double-charge | `processed` flag checked in Firestore transaction before adding credits |
| CSRF | Stripe webhooks verified via signature header (`STRIPE_WEBHOOK_SECRET`) |
| Admin impersonation | Role checked server-side on every admin route via `getSessionAccount()` |
| Report access by wrong user | Report ownership verified by matching `accountCode` before returning data |
| Build-time secret exposure | Firebase Admin uses lazy proxy init — no crash or leak during `next build` |
