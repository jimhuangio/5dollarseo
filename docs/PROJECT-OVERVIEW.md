# Project Overview — $5 SEO

## What Is This?

$5 SEO is a **pay-per-use SEO reporting platform**. Instead of paying $100–$500/month for tools like Semrush or Ahrefs that most users only open once a month, customers pay $5 per report and own it for 60 days.

No subscription. No wasted credits. No account to forget about.

---

## The Problem We Are Solving

| The Old Way | The $5 SEO Way |
|---|---|
| $99–$499/month subscription | $5 per report, pay only when you need it |
| Must remember to cancel | No recurring charges ever |
| Requires learning a complex tool | Run a report in under 60 seconds |
| Email + password to manage | Just a code — no login friction |
| Data locked to their platform | Download CSV or PDF, it is yours |

---

## Target Audience

**Primary:**
- Freelancers and consultants who need occasional SEO data for client work
- Small business owners who want a one-time site health check
- Developers who need keyword or backlink data for a single project

**Secondary:**
- Agencies that want a cheap tool for ad-hoc research between tool subscriptions
- Students and learners who cannot afford professional SEO tools

---

## How It Works — User Journey

```
1. Visit the site
      ↓
2. Generate an account code (no email, no password)
      ↓
3. Save the code — it is the only key to your account
      ↓
4. Purchase credits ($5 each)
      ↓
5. Choose a tool, fill in the form, confirm credit spend
      ↓
6. Report generates (10 seconds to 2 minutes depending on tool)
      ↓
7. View report in-browser, download CSV or PDF
      ↓
8. Report saved to dashboard for 60 days
      ↓
9. Return with your code anytime to view past reports
```

---

## Core Principles

- **No friction** — A user can go from landing page to running their first report in under 2 minutes
- **No lock-in** — Reports are downloadable. Users own their data
- **No waste** — Credits only deducted when a report successfully runs
- **Transparent pricing** — Every tool costs 1 credit ($5). No hidden tiers
- **Privacy-first** — No email collected. No personal data required

---

## What Makes the Login System Unique

Inspired by Mullvad VPN, users receive a **14-character account code** instead of an email/password combination.

**Code format:** `XXXX-XXXXX-XXXXX`
**Character set:** 27 safe characters with confusable glyphs removed (no `0`, `O`, `1`, `l`, `I`)
**Security:** 27^14 ≈ 10^20 combinations — brute force is computationally impossible with rate limiting in place

The code is stored in the browser for convenience but can be used on any device.

---

## Revenue Model

| Action | Price |
|---|---|
| 1 credit | $5.00 |
| 5 credits (bundle) | $20.00 (save $5) |
| 12 credits (bundle) | $45.00 (save $15) |

**Cost to serve one report:** DataForSEO API costs $0.10–$0.30 per tool run depending on the tool. Margin per credit is approximately $4.70–$4.90.

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (Vercel serverless) |
| Database | Firebase Firestore |
| File Storage | Firebase Storage |
| SEO Data | DataForSEO API |
| Web Scraping | Bright Data (site audit crawling) |
| Payments | Stripe (pending) |
| Hosting | Vercel |

See `ARCHITECTURE.md` for full technical decisions.
