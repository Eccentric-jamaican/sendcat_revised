---
trigger: always_on
description: Frontend guidelines (mobile-first + modern UI)
globs: **/*.ts,**/*.tsx,**/*.js,**/*.jsx
---
# Frontend Guidelines (Mobile-first, modern “Webflow/Framer” polish)
1. **Mobile-first defaults (content-driven breakpoints)**
   - Write the base UI for small screens first.
   - Add responsive breakpoints only when the layout needs it (content-driven), not by habit.
   - Avoid fixed layout widths like `w-[500px]`.
   - Prefer fluid constraints:
     - `w-full` + `max-w-*`
     - For reading widths: `max-w-prose` / `max-w-[65ch]`
2. **Layout: single-column flow first, choose Flex vs Grid intentionally**
   - Default to a **single column** on mobile.
   - Use **Flex** for:
     - nav bars, toolbars, button rows, alignment, “space-between” layouts
   - Use **Grid** for:
     - product grids, card layouts, galleries, feature tiles
   - Don’t force `flex flex-col` everywhere—pick the layout primitive that matches the content.
3. **Spacing & rhythm (modern feel)**
   - Use consistent spacing steps and increase whitespace on larger screens.
   - Common patterns (not mandatory):
     - `p-4 md:p-8`
     - `gap-4 md:gap-6`
   - Prefer fewer elements with more breathing room over dense UI.
4. **Tap targets (accessible + practical)**
   - Default goal: **44×44 CSS px** for primary/tap-first controls (buttons, inputs, main nav actions).
   - Compact icon buttons are allowed if they remain easy to tap:
     - Use padding/hit-area even when the icon is small (the hit target can be larger than the icon).
     - A practical minimum is often `min-h-[40px] min-w-[40px]` for compact icon buttons.
   - Inline links inside paragraphs are treated differently than standalone controls—don’t over-pad inline text links.
5. **Typography (single source of truth: Fluid Type system)**
   - We use a custom “Fluid Type” system in Tailwind.
   - NEVER use: `text-4xl`, `text-5xl`, `text-xl` (unless for icons).
   - ALWAYS use semantic classes for text:
     - Hero/Main Title: `text-h1 font-bold leading-tight`
     - Section Headers: `text-h2 font-semibold leading-tight`
     - Card Titles: `text-h3 font-medium`
     - Body Paragraphs: `text-body leading-relaxed text-muted-foreground`
     - Captions/Meta: `text-sm-fluid text-muted-foreground`
   - Keep long-form text readable:
     - constrain width (`max-w-prose` / `max-w-[65ch]`)
     - avoid tiny text on mobile
6. **Navigation (clean, conversion-focused)**
   - Prefer a clean header: logo + minimal links + 1 clear primary CTA.
   - Use a `Sheet/Drawer` for mobile menus when links don’t fit comfortably.
   - Don’t hide important content just because the screen is small—restructure the layout.
7. **Images (responsive, avoid distortion)**
   - Ensure media never overflows:
     - Use responsive sizing (`w-full h-auto`) and sensible container constraints.
   - Use `object-cover` only when intentional cropping is desired (hero/media cards), not as a blanket rule.
   - Prefer providing dimensions for images when possible to reduce layout shift.
8. **UI polish (what makes it feel “Webflow/Framer”)**
   - Use clear hierarchy: fewer fonts/weights, consistent headings, intentional contrast.
   - Prefer subtle, consistent styling:
     - consistent radius scale
     - restrained shadows
     - consistent spacing
   - Avoid visual clutter: remove redundant links/actions; keep primary actions obvious.
9. **shadcn/ui + bun workflow**
   - Use shadcn/ui primitives by default.
   - If a component isn’t present in `components/ui`, add it via shadcn.
   - Package manager is **bun**.
When I ask for a component, generate the **mobile view first**.
