# TODO: EventDashboard “Finalize & Disseminate” stale grandTotal fix (strict scope)

## Done
- [x] Identified root cause: materials edits persist until onBlur; user can click finalize before blur/save finishes, causing stale/zero grandTotal.

## To do
1. Update `src/app/pages/EventDashboard.tsx`
   - [ ] Add `pendingMaterialUpdates` tracking (Set) for in-flight `updateMaterial` calls.
   - [ ] Update `handleMaterialSubmit()` to be async-safe: mark pending, try/catch/finally, return success/failure.
   - [ ] Ensure `onBlur` awaits submission.
   - [ ] Update `handleDisseminate()` to block dissemination when `pendingMaterialUpdates` is non-empty, showing alert.
   - [ ] Ensure `grandTotal` used for `disseminateBudget(grandTotal)` is computed from latest committed `materials` (blocked while pending).
2. Role normalization defensively (comparisons only) in other files (NOT included in this strict-scope patch unless separately approved).
