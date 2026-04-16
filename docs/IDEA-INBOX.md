# Idea Inbox

This file captures every feature idea, enhancement, and suggestion — evaluated or not. Nothing is deleted. Ideas move to the roadmap when prioritized.

**Status labels:** 💡 Raw idea | 🔍 Being evaluated | ✅ Moved to roadmap | ❌ Rejected (with reason)

---

## Core Tool Enhancements

### 💡 Bulk Keyword Research
Run keyword research for up to 10 keywords in one credit.
- **Rationale:** Power users (agencies, content teams) often need to compare multiple keywords at once. One credit for 10 keywords is still great value vs. $100+/month subscriptions.
- **Implementation note:** DataForSEO's search volume endpoint accepts an array of keywords. Minimal extra cost.

### 💡 Domain Overview Tool
Show overall domain health — organic traffic estimate, top keywords ranking, domain rating, and recent changes.
- **Rationale:** The most common first question users have about any domain. open-seo has a working implementation using DataForSEO's `domain_overview` endpoint.
- **Reference:** `github.com/every-app/open-seo` — `DomainService`

### 💡 Competitor Comparison
Run keyword or backlink analysis on two domains side by side.
- **Rationale:** Agencies consistently want "my site vs. theirs." High perceived value, single UI change.

### 💡 Historical SERP Tracking
Track a keyword's SERP position over time with multiple snapshots.
- **Rationale:** High value but requires repeat credit spend. Could be a premium offering. Each re-run is a new report.

### 💡 On-Page SEO Analyzer
Analyze a single URL for on-page factors — keyword density, title optimization, content structure, schema markup.
- **Rationale:** Complements site audit. User might want to focus on one page, not run a full crawl.

### 💡 Local SEO SERP
Return search results for a specific city or region, not just country.
- **Rationale:** Small businesses care about local rankings, not national. DataForSEO supports city-level location codes.

---

## User Experience

### 💡 Report Sharing — Public Link
Generate a shareable link to a report that works without a code.
- **Rationale:** Freelancers want to send reports to clients without giving clients access to their full account. Link expires with the report (60 days).
- **Implementation:** Generate a signed token stored on the report document. Public route `/r/{token}` renders the report read-only.

### 💡 Report Annotations
Add notes or highlights to in-browser reports before sharing or downloading.
- **Rationale:** Agencies always annotate before sending to clients. Adds professional polish.

### 💡 Email Report Delivery (Optional)
After purchase, optionally enter an email to receive the report as a PDF attachment.
- **Rationale:** Some users prefer email over a dashboard. Entirely opt-in — no email required.
- **Implementation:** Collect email at payment time in Stripe Checkout. Store only for report delivery, then discard.

### 💡 Report Templates / Branding
Let users add a logo and color scheme to PDF reports for client delivery.
- **Rationale:** Agencies need branded deliverables. Could be a premium feature (2 credits instead of 1).

### 💡 Re-Run a Report
Pay 1 credit to re-run the same report with the same inputs (useful for tracking changes).
- **Rationale:** Users may want to check backlinks after a month or re-audit after making fixes. Pre-fills form with locked inputs as defaults.

---

## Business & Growth

### 💡 Referral Program
Share a referral code; when a friend purchases their first credit, both accounts get 1 free credit.
- **Rationale:** Word-of-mouth acquisition. Low cost, high virality for a tool freelancers recommend to each other.

### 💡 Credit Expiry (12 months)
Credits expire 12 months after purchase if unused.
- **Rationale:** Incentivizes use, reduces accounting liability. Standard for prepaid credit models. Notify users 30 days before expiry.

### 💡 Team / Agency Codes
One "parent" code manages multiple "child" codes, with a shared credit pool.
- **Rationale:** Agencies have multiple team members. Currently each person needs their own code and credits.
- **Complexity:** High. Requires parent/child account relationship in Firestore.

### 💡 API Access Tier
Developers can hit tool endpoints directly via API key instead of the UI.
- **Rationale:** Developers want to integrate SEO data into their own tools. Same credit model applies.
- **Implementation:** Issue API keys linked to an account code. Accept `Authorization: Bearer {key}` on tool routes.

### 💡 Volume Pricing for Bulk Credits
Discounts at 25, 50, 100 credits.
- **Rationale:** Attracts agencies. Locks in revenue upfront.

---

## Operations & Admin

### 💡 Admin Dashboard Analytics
Charts showing credits purchased, reports generated, most popular tools, revenue by day.
- **Rationale:** Currently admin can see individual records but has no aggregate view.

### 💡 Flagging Suspicious Accounts
Auto-flag accounts that run many reports in a short window (possible abuse of elevated status).
- **Rationale:** Elevated accounts are for internal testing. If someone shares an elevated code, we need to detect it.

### 💡 Manual Credit Grant
Admin can add credits to any account directly from the admin panel.
- **Rationale:** Customer service — if a tool fails or a user has an issue, admins need a way to compensate without going to Stripe.
- **Status:** 🔍 Being evaluated — low complexity, high utility.

### 💡 Report Archive for Admin
Separate admin-only storage path for reports retained beyond the 60-day user window.
- **Rationale:** Already planned in architecture. Implement during Phase 5.

---

## Rejected Ideas

### ❌ Subscription Option
Offer a monthly subscription alongside credits.
- **Rejected because:** This defeats the entire product thesis. We are not competing with Semrush — we are the alternative for people who do not want subscriptions. Adding one creates confusion and support overhead.

### ❌ User Profiles / Account Names
Let users give their account a display name.
- **Rejected because:** Adds PII and complexity without meaningful value. The code is the identity.

### ❌ Social Login (Google, GitHub)
- **Rejected because:** Our competitive advantage is no-account access. Adding OAuth creates the exact friction we are trying to eliminate. Also requires GDPR handling.

### ❌ Free Tier (1 free report per account)
- **Rejected because:** Easy to abuse — create unlimited accounts for unlimited free reports. Our code generation is too cheap to prevent this without email verification, which we deliberately do not have.
