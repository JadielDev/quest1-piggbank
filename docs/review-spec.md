# Review Spec

## Summary

This review assesses the current uncommitted dashboard date-range filter work against `docs/specs/SPEC-filtro-periodo.md` and the project rules in `CLAUDE.md`.

## Spec Compliance

- **ALTO:** The code does not surface an explicit invalid-query behavior for malformed `from`/`to` params. `getDateRangeFromQuery()` silently returns `undefined` and the page falls back to the default range.
  - Suggestion: define and implement the expected handling of invalid query params in the spec, or add a warning/validation state so this behavior is explicit.

- **MÉDIO:** The period is displayed only in the filter button label. The spec expects a visible period presentation in the dashboard header, so confirm whether this is acceptable or if a dedicated badge is required.
  - Suggestion: if the UX spec calls for a separate header label, add a small period badge near the filter.

- **OK:** The implementation uses query params as the source of truth and keeps the filter logic in a client component while the dashboard page remains server-rendered.

## Architecture

- **OK:** `getTransactions()` and `getMetrics()` centralize date filtering in `src/lib/api.ts`, so metrics and transactions use the same source of truth.

- **MÉDIO:** `src/components/ui/popover.tsx` now embeds `buttonVariants` styling inside the popover trigger. This creates a tighter coupling between the popover primitive and button styling.
  - Suggestion: prefer `asChild` or a separate button wrapper to keep the primitive trigger reusable.

- **MÉDIO:** `DashboardClient` maintains local transaction state and recomputes metrics on the client. This is acceptable, but verify that server-rendered `initialTransactions` always reflect query param changes and do not diverge from the filter state.

## Code Quality

- **ALTO:** `DateRangeFilter.tsx` mixes UI rendering and validation logic in one component, including inline validation branching and a ternary-based `onSelect` update.
  - Suggestion: move validation message generation and range sanity checks to a helper in `src/lib/date.ts` or a small local utility.

- **MÉDIO:** `handleApply()` builds URL params from `searchParams.entries()`, but does not normalize or sanitize existing query state beyond `from` and `to`. This is fine for now, however explicit query cleanup would improve reliability.

- **OK:** There are no direct `any` types or security-sensitive constructs in the reviewed implementation.

## Performance

- **OK:** No N+1 patterns or HTTP/DB issues are introduced.
- **MÉDIO:** Pagination is still missing from the transactions table. The current mock app likely tolerates this, but production workloads should consider pagination or virtualized rendering later.
- **OK:** Metrics are memoized in `DashboardClient`, which avoids unnecessary recalculation on every render.

## Security & LGPD

- **OK:** No secrets, personal-data logs, or HTTP request types are present in the reviewed code.
- **OK:** Date handling remains in `src/lib/date.ts`, which aligns with the project’s data handling pattern.

## Test Coverage

- **OK:** `DateRangeFilter.test.tsx` covers render, popover opening, apply click, and invalid-range UI state.
- **OK:** `src/lib/date.test.ts` has strong coverage for date parsing, query normalization, same-day ranges, max-range logic, and future-date rules.
- **OK:** `src/lib/api.test.ts` validates transaction filtering and metric derivation.

- **MÉDIO:** No integration-level test was observed for the full route refresh path from `DateRangeFilter` → query params → `DashboardPage` → filtered `DashboardClient` props.
  - Suggestion: add a higher-level test or page-level assertion that query changes produce the expected filtered transactions and metrics.

- **MÉDIO:** The invalid query fallback path is covered only in utility tests, not at the page/UI level. Explicit page behavior should be asserted in tests if the spec intends this to be user-visible.

## Issues by category

### Spec Compliance
- ALTO: invalid query behavior is implicit rather than explicit.
- MÉDIO: dashboard period display may not match the intended header UX.
- MÉDIO: metrics empty-state semantics should be validated against the spec.

### Architecture
- MÉDIO: tight coupling between `PopoverTrigger` and button variants.
- MÉDIO: verify server/client contract for filtered `initialTransactions` after URL updates.

### Code Quality
- ALTO: `DateRangeFilter.tsx` should delegate validation and range messaging to helpers.
- MÉDIO: query param normalization in `handleApply()` could be more explicit.

### Performance
- MÉDIO: no pagination in `TransactionsTable`, acceptable for mock data but worth noting.

### Security & LGPD
- OK: no findings.

### Test Coverage
- ALTO: missing integration coverage for query propagation and full page refresh semantics.
- MÉDIO: no explicit page-level invalid-query fallback test.

## Recommendation

This implementation is mostly aligned with the spec and project rules. The highest-priority fix is to make invalid-query handling explicit and add a page-level integration test for query-driven filtering. After that, clean up the popover/button coupling and verify the dashboard period display against the spec UX.
