# Development Workflow

Guidelines for how we build, debug, and extend this codebase consistently.

---

## Core Principle: Surgical Changes Only

Every change should touch the minimum amount of code necessary. The larger the diff, the higher the risk of introducing bugs in unrelated areas.

**Rule:** When making a change, state the target explicitly before writing any code:
```
Target: KeywordOverview.tsx — update only the chart line color (line 82)
Change: stroke="#18181b" → stroke="#2563eb"
```

Never rewrite a component to fix one line.

---

## AI-Assisted Development Rules

These rules prevent AI tools from going rogue and rewriting unrelated code.

### 1. Specify Exactly What to Change

| Instead of | Use |
|---|---|
| "Fix the button styling" | "In `CreditConfirmDialog.tsx` (line 38), change the confirm button variant from `default` to `destructive`" |
| "Update the keyword page" | "In `src/app/tools/keyword-research/page.tsx`, in the `handleConfirm` function, add error handling for a 429 status code" |
| "Improve the admin panel" | "In `src/app/admin/page.tsx`, in the `users` TabsContent block (around line 140), add a search input that filters the `users` array by code" |

### 2. Output Only the Changed Section

When requesting code changes, ask for output in this format:
```
// FILE: src/components/tools/CreditConfirmDialog.tsx
// FUNCTION: CreditConfirmDialog (lines 25–55)
// CHANGE: update confirm button variant

// --- BEFORE ---
<Button onClick={onConfirm}>
  Confirm — use 1 credit
</Button>

// --- AFTER ---
<Button variant="destructive" onClick={onConfirm}>
  Confirm — use 1 credit
</Button>
```

### 3. Reference Line Numbers or Function Names

Before asking for a change, read the file and note the exact location:
- "In the `handleConfirm` async function in `keyword-research/page.tsx`"
- "In the `StatCard` component inside `KeywordOverview.tsx` (lines 17–22)"
- "In the `GET` handler in `api/accounts/[code]/route.ts`"

### 4. Use Chat for Logic, Build for Code

- **Chat / planning mode:** Work through what needs to change and why before touching any files
- **Code mode:** Once the approach is decided, write the minimal targeted diff
- Never use code mode to "explore" — explore in chat, execute in code

### 5. Diff Review Before Accepting

After any AI-generated change:
1. Read the diff line by line
2. Confirm only the intended lines changed
3. Run `npm run build` to verify no TypeScript errors introduced
4. Check that unrelated files are untouched

---

## Feature Planning Process

### Step 1 — Add to Idea Inbox First

Every new idea goes to `docs/IDEA-INBOX.md` before any code is written. Include:
- What the feature does
- Why it matters to the user
- Rough implementation approach

### Step 2 — Evaluate Against Current Phase

Ask: does this belong in the current phase, or is it a post-launch enhancement?
- If it is required for the phase goal → add to `docs/ROADMAP.md` current phase checklist
- If it is optional → keep in `IDEA-INBOX.md` with status 🔍
- If it contradicts the product thesis → mark ❌ with reason

### Step 3 — Plan Before Implementing

For any feature touching more than one file:
1. List every file that will change
2. List every file that might be affected
3. Identify what mock data or tests are needed
4. Estimate which existing components can be reused

### Step 4 — Implement in Order

```
Types first (src/types/index.ts)
  → Library functions (src/lib/)
    → API route (src/app/api/)
      → UI components (src/components/)
        → Page (src/app/)
          → Build check (npm run build)
```

Never build the UI before the API contract is defined.

### Step 5 — Update Docs

After implementing:
- Check off items in `docs/MVP.md`
- Move items in `docs/ROADMAP.md` from 🔲 to ✅
- Update `docs/ARCHITECTURE.md` if a new technical decision was made

---

## Debugging Strategy

### Step 1 — Identify the Layer

Every bug lives in one of these layers. Start by narrowing it down:

| Symptom | Likely Layer |
|---|---|
| UI renders wrong data | Component or mock data |
| Button does nothing | Event handler or state transition |
| API returns 400/422 | Request body validation |
| API returns 500 | Server-side function or Firebase |
| API returns 502 | External API (DataForSEO, Bright Data) |
| Build fails | TypeScript types |
| Report not saving | Firestore write path |
| Credits not deducting | Transaction in `accounts.ts` |

### Step 2 — Check the Checklist in MVP.md

Before debugging, confirm the feature is actually marked complete in `docs/MVP.md`. If it is not checked, the feature was never fully implemented — do not debug, implement it.

### Step 3 — Isolate with the Minimal Reproduction

Reproduce the bug with the smallest possible input:
- Wrong keyword → use "test"
- Wrong domain → use "example.com"
- Wrong URL → use "https://example.com"

If the bug reproduces with a simple input, it is a code issue. If it only happens with specific real-world data, it is a data issue.

### Step 4 — Check External API Responses First

For tools, always check what the API actually returned before assuming the parsing code is wrong:
```typescript
// Temporarily log raw API response
console.log(JSON.stringify(rawResponse, null, 2));
```
DataForSEO returns structured error codes in the response body even on HTTP 200. Check `status_code` on both the outer response and the task.

### Step 5 — Fix Forward, Not Backward

Do not add workarounds that patch symptoms. Fix the root cause:
- If DataForSEO returns an unexpected shape → update the parser
- If Firestore returns null → check the document exists before reading
- If a component renders nothing → check the data prop is not undefined

---

## Code Quality Standards

### File Size Limits

| File type | Target | Maximum |
|---|---|---|
| Page component | 100–200 lines | 300 lines |
| UI component | 50–150 lines | 200 lines |
| API route | 30–80 lines | 120 lines |
| Library function file | 80–200 lines | 300 lines |

If a file exceeds the maximum, split it. Example: `SiteAuditOverview.tsx` could split into `SiteAuditSummary.tsx`, `LighthouseCard.tsx`, and `AuditPagesTable.tsx`.

### No Console Logs in Production

Use `console.log` only during active debugging. Remove before committing. The rule: if a line of code is not doing work, it does not belong in the file.

### TypeScript — No `any`

Every function parameter and return type must be explicitly typed or correctly inferred. Use `unknown` for external API responses and narrow with type guards before accessing properties.

### Immutability

Never mutate state directly:
```typescript
// Wrong
reports.push(newReport);
setState(reports);

// Correct
setState((prev) => [...prev, newReport]);
```

---

## Git Workflow

### Commit Message Format
```
type: short description (under 72 chars)

Optional longer body explaining why, not what.
```

Types: `feat` `fix` `refactor` `docs` `chore`

### Branch Strategy

- `main` — always deployable, always passing build
- Feature branches for anything that takes more than one session to complete
- Merge via PR when working with collaborators

### Before Every Commit

```bash
npm run build    # must pass with zero errors
```

No exceptions. A broken build is never committed to main.
