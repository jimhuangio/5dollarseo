# Customer Communication Guide

How to talk to users and potential customers about what $5 SEO does — without using technical language.

---

## The One-Sentence Pitch

> "Pay $5, get a professional SEO report, download it and keep it forever. No subscription, no account, just a code."

---

## Plain-Language Explanations

Use these when explaining features to non-technical users, clients, or in marketing copy.

### The Account Code System

**Technical reality:** Cryptographically random 14-character alphanumeric code stored in Firestore with rate-limited lookup.

**How to explain it:**
> "Instead of creating a username and password, we give you a unique code — like a locker combination. You type that code to access your dashboard. Save it somewhere safe, like a note on your phone. If you lose it, we cannot recover it, just like a lost locker key."

**Why users should not worry:**
> "The code is automatically saved in your browser, so you will not need to type it every time you visit on the same device."

---

### Credits

**Technical reality:** Integer field on Firestore document, decremented via transaction on tool run.

**How to explain it:**
> "Credits are like tokens at an arcade. You buy a token for $5, you use it to run one report. You can buy as many as you need, whenever you need them. They never expire within a year."

**Objection: "What if the report fails?"**
> "If a report fails to generate due to a technical problem on our end, the credit is not deducted. You are only charged when you receive a completed report."

---

### Report Storage and Deletion

**Technical reality:** Soft-delete sets `deletedByUser: true`, hard-delete sets `hardDeletedAt`. Reports retained server-side for admin access regardless.

**How to explain it to users:**
> "Your reports are saved for 60 days. You can delete a report from your dashboard at any time if you no longer need it — but we keep a copy on our end for legal and support purposes. After 60 days, the report is removed from your account permanently."

**How to explain the 60-day window:**
> "Think of it like a printed receipt. We keep a copy for 60 days in case you need to refer back to it, then it is automatically discarded."

---

### What Happens to User Data

**Technical reality:** No PII collected. Firestore stores account code, credit balance, and report results only.

**How to explain it:**
> "We do not collect your name, email address, or any personal information. Your account is identified only by your code. We cannot contact you and we cannot identify who you are — that is by design. The only data we store is your credit balance and the reports you have run."

---

## Communicating Technical Status to Customers

### When a Tool Is Slow

Do not say: "The API is experiencing latency."

Say: "The site audit tool can take up to 2 minutes when crawling large websites. This is normal — we are checking every page on your site individually."

---

### When a Tool Fails

Do not say: "DataForSEO returned a non-200 status code on the backlinks endpoint."

Say: "Something went wrong fetching your backlink data. Your credit was not deducted. Please try again in a few minutes. If the problem persists, contact us and we will look into it."

---

### When Announcing New Features

**Template:**
> "We just added [feature name]. Here is what it does: [one sentence]. Here is how to use it: [one sentence]. It costs [X credits]. [Optional: here is why we built it]."

**Example:**
> "We just added Domain Overview. It gives you a snapshot of any website's organic traffic, top keywords, and overall authority score — all in one report. Go to your dashboard, click 'Run a tool,' and choose Domain Overview. It costs 1 credit."

---

### When Raising Prices

Be direct. Never bury it.
> "Starting [date], credits will cost $6 instead of $5. Any credits you have already purchased will not be affected. We are making this change because [reason — be honest: API costs have increased, infrastructure costs, etc.]."

---

## Support Response Templates

### Lost Account Code

> "Unfortunately, we are not able to recover a lost account code. This is part of how our privacy-first system works — we do not store any information that connects your identity to your code. If your code is lost, you can create a new account for free. I am sorry I cannot do more."

---

### "Can I get a refund?"

> "If a report failed to generate and your credit was deducted in error, we will absolutely return the credit to your account — just share your account code and the date of the failed report. For credits that were used to generate a completed report, we are not able to issue refunds, as the data was delivered. If you are unhappy with the quality of a report, tell us what was wrong and we will look into it."

---

### "Is my data secure?"

> "Yes. We do not store your name, email, or payment details — Stripe handles payments securely and we never see your card number. Your account is identified only by a random code that you control. Your reports are stored on Google Firebase, one of the most secure cloud platforms available. We never sell or share your data."

---

## Keeping Customers Informed During Development

### Principle: Show Progress, Not Problems

Users do not need to know what is broken. They need to know what is coming and when.

**Bad:** "We are still working on PDF downloads, sorry."
**Good:** "PDF downloads are coming in the next update. For now, CSV download is available on all reports."

### Changelog Format

When shipping updates, post a short changelog in plain language:

```
Update — [Month Day, Year]

Added:
- PDF download now works on all reports

Improved:
- Site audit now crawls up to 50 pages (was 25)
- Keyword research results load 2x faster

Fixed:
- Backlink checker showed incorrect referring domain count for some domains
```

### What Never to Communicate Publicly

- Internal error messages or stack traces
- Database structure or field names
- API provider names or costs (competitive information)
- Admin account codes or elevated user details
- Anything that reveals how the rate limiting or security works

---

## Tone and Voice

| Context | Tone |
|---|---|
| Landing page | Confident, direct, no fluff |
| Dashboard UI | Functional, clear, no jargon |
| Error messages | Calm, specific, actionable |
| Support responses | Human, honest, no corporate-speak |
| Changelogs | Short, specific, user-benefit-first |

**Always write as if talking to a smart person who is not a developer.** Assume they know what SEO is but not how APIs work.
