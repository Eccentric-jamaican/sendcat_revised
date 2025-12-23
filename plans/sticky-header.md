# Plan: Sticky Header & Search Input

## 0. Metadata
- Status: done
- Owner: agent
- Created: 2025-12-19
- Last updated: 2025-12-19
- Related: `app/app/layout.tsx`, `app/app/page.tsx`

## 1. Goal
Make the top header bar (containing the sidebar trigger and user avatar) and the search input sticky so they remain visible when the user scrolls down the page.

## 2. Non-goals (out of scope)
- Changing the sidebar behavior.
- Modifying mobile sheet/drawer behavior.
- Redesigning the header layout.

## 3. Requirements
### Functional
- Header bar stays fixed at the top of the main content area when scrolling.
- Search input stays fixed below the header when scrolling.
- Content scrolls beneath the sticky elements.

### Non-functional
- Performance: No layout shift or jank during scroll.
- Compatibility: Works on desktop and mobile viewports.

## 4. Assumptions & Open Questions
### Assumptions
- The header is currently in `layout.tsx` and the search bar is in `page.tsx`.
- We can make the header sticky in the layout and the search bar sticky in the page, or consolidate them.

### Open questions (blocking vs non-blocking)
- [NON-BLOCKER] Should the sticky search have a backdrop blur effect for polish?

## 5. Proposed Approach
### Architecture / design sketch
1. In `layout.tsx`: add `sticky top-0 z-30` to the header `<div>` containing the sidebar trigger and avatar.
2. In `page.tsx`: wrap the search bar in a sticky container with `sticky top-[header-height] z-20` so it sticks just below the header.
3. Ensure the scrollable content area has proper overflow handling by making the `<main>` element the scroll container (`overflow-y-auto`), since `position: sticky` is relative to the nearest scroll ancestor.

### Interfaces & contracts
- CSS only change; no API/DB changes.

## 6. Work Breakdown (ordered)
1. Make header sticky in `layout.tsx`.
2. Make search input sticky in `page.tsx` (Explore mode).
3. Verify scroll behavior and z-index layering.

## 7. Testing & Validation
- Manual QA: scroll the page and confirm header + search remain visible.
- Check mobile and desktop viewports.

## 8. Rollout / Migration / Rollback
- No migrations needed.
- Rollback: revert CSS changes.

## 9. Risks & Mitigations
- Risk: z-index conflicts with sidebar or modals.
- Mitigation: Use appropriate z-index values (z-30 for header, z-20 for search).

## 10. Change Log
- 2025-12-19: Created plan.
- 2025-12-19: Implemented sticky header in layout.tsx (sticky top-0 z-30 bg-[#050505]).
- 2025-12-19: Implemented sticky search bar in page.tsx (sticky top-[57px] z-20 bg-[#050505]).
- 2025-12-19: Wrapped scrollable content with proper padding.
- 2025-12-19: Fixed sticky not working by making `<main>` the scroll container (`overflow-y-auto h-screen`) so sticky elements have a valid scroll ancestor. Marked as done.
