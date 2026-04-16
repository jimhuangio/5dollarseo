# $5 SEO — Documentation Index

## Discover

What the product is and why it exists.

| Document | What it covers |
|---|---|
| [Project Overview](PROJECT-OVERVIEW.md) | Purpose, target audience, user journey, revenue model, tech stack summary |
| [Idea Inbox](IDEA-INBOX.md) | All feature ideas — raw, evaluated, rejected — with rationale |

## Research

How we make decisions and what we have built.

| Document | What it covers |
|---|---|
| [Architecture](ARCHITECTURE.md) | Every technical decision and why: database choice, auth model, API providers, file structure, data model, security |
| [MVP](MVP.md) | Full checklist of completed features + pending features blocking launch (P0/P1/P2) |

## Plan

Where we are going and how we will get there.

| Document | What it covers |
|---|---|
| [Roadmap](ROADMAP.md) | Phase-by-phase plan with status indicators, tasks per phase, and post-launch enhancements |
| [Development Workflow](DEVELOPMENT-WORKFLOW.md) | How to make changes safely, AI-assisted development rules, debugging strategy, code quality standards |

## Operate

How to communicate and run the product.

| Document | What it covers |
|---|---|
| [Customer Communication](CUSTOMER-COMMUNICATION.md) | Plain-language explanations, support templates, tone guide, what never to say publicly |

---

## Quick Status

**Build:** ✅ Passing — 21 routes, zero TypeScript errors
**Phase:** Phase 3 complete (tools UI + API wired). Phase 4 next (Firebase integration).

### What works right now (no Firebase needed)
- All 4 tool pages run with real DataForSEO + Bright Data API calls
- Dashboard renders with mock data
- Admin panel renders with mock data
- CSV download works on all tools
- Account code generation and validation routes are built

### What needs Firebase to work
- Account creation persistence
- Credit balance (real, not mock)
- Report saving after tool run
- Dashboard loading real reports

### What needs Stripe to work
- Purchasing credits
- Credit top-up webhook
