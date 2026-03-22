

# Full Design & Brand Audit: pr0ducent vs newsc0rp Reference

## Current State Summary

After comparing every major file in both projects, here are the gaps between pr0ducent and the newsc0rp reference implementation.

---

## CRITICAL ISSUES

### 1. Nav icon images are broken/empty placeholders
The last diff shows all 10 `src/assets/nav-icons/*.png` files were created as binary but generated in a single batch with no visual QA. These are likely corrupted or empty 1x1px files. The menu currently shows blank squares where emblems should be.

**Fix:** Regenerate all 10 icons one-by-one using AI image generation, QA each one, and replace the broken files.

### 2. Desktop dropdown is positioned inside `menuRef` (inside header flex)
In newsc0rp, the menu dropdown is an `absolute top-full left-0 right-0` child of the `sticky-header` wrapper. In pr0ducent, `desktopDropdown` is rendered inside the right-side `<div ref={menuRef}>` flex container, which means it inherits wrong positioning and clips.

**Fix:** Move `desktopDropdown` render out of the right-side flex div, make it a direct child of the `sticky-header` wrapper (like newsc0rp lines 196-228).

### 3. Missing `section-cv` containment wrapper
newsc0rp wraps heavy sections in `<div className="section-cv">` (`contain: layout style`) for paint isolation. pr0ducent has the CSS class but never uses it on any section.

**Fix:** Wrap `FeatureMatrix`, `PlanComparisonTable`, `BuilderComparisonTable`, `ExperimentHistory` in `section-cv` divs.

---

## DESIGN & LAYOUT GAPS

### 4. No section background washes on homepage sections
newsc0rp applies unique gradient washes to each section (`section-gradient-peach`, `section-wash-blush`, `section-wash-indigo`, etc.) creating a continuous color tapestry. pr0ducent only uses `section-gradient-gold` on HowItWorks and `section-gradient-rose` on FAQ. The other 5 sections (BuilderComparisonTable, FeatureMatrix, PlanComparisonTable, InlineCalculator, HomepageBlogSection) have no background wash -- they look flat and disconnected.

**Fix:** Assign alternating washes to every homepage section:
| Section | Wash class |
|---------|-----------|
| HowItWorks | `section-gradient-gold` (already) |
| BuilderComparisonTable | `section-gradient-peach` |
| FeatureMatrix | `section-wash-blush` |
| PlanComparisonTable | `section-wash-indigo` |
| InlineCalculator | `section-wash-gold` |
| FAQ | `section-gradient-rose` (already) |
| HomepageBlogSection | `section-wash-teal` |
| ExperimentHistory | `section-gradient-lavender` |

### 5. No BigHeadline / editorial section dividers
newsc0rp uses `BigHeadline` components with massive serif text between major sections (e.g. "One engine. Infinite media." at `clamp(3.2rem, 9vw, 9rem)`). pr0ducent has no equivalent -- sections just stack with no dramatic pacing.

**Fix:** Create a `BigHeadline` component (copy from newsc0rp) and insert 2-3 between key sections on the Index page:
- Before BuilderComparisonTable: "One prompt. Every builder."
- Before InlineCalculator: "Know your cost before you build."
- Before FAQ: "Still have questions?"

### 6. No IllustDivider between sections
newsc0rp places large monochrome illustrations between sections with float/pulse animations. pr0ducent has no visual breaks between content blocks.

**Fix:** Create `IllustDivider` component (copy from newsc0rp). Use 2-3 of the existing caricature assets or generate new editorial illustrations for section breaks.

### 7. Missing `section-wash-*` CSS classes
pr0ducent has `section-gradient-*` classes but is missing the subtler `section-wash-blush`, `section-wash-indigo`, `section-wash-gold`, `section-wash-teal` classes that newsc0rp uses for transition sections.

**Fix:** Copy the 4 `section-wash-*` classes from newsc0rp's `index.css` (lines 432-451) plus `section-gradient-teal` and `section-gradient-lavender`.

### 8. Footer is light-only, not dark section
newsc0rp footer uses `section-dark dot-grid-bg` (dark background with dot grid pattern). pr0ducent footer is a plain light section with no visual weight.

**Fix:** Refactor `Footer.tsx` to use `section-dark dot-grid-bg` pattern matching newsc0rp's `FooterSection.tsx`. Keep existing links/content but apply the dark treatment.

### 9. Missing `section-cv` on FeatureMatrix, PlanComparisonTable
These heavy DOM sections should use `contain: layout style` for rendering performance.

---

## COMPONENT PARITY GAPS

### 10. No `BrandText` utility component
newsc0rp has a reusable `BrandText` component that auto-sizes digits to 2em. pr0ducent manually inlines the brand styling everywhere (Logo, Footer). This leads to inconsistency.

**Fix:** Create `src/components/BrandText.tsx` (copy from newsc0rp). Refactor Logo in PageFrame and Footer to use it.

### 11. `useInView` hook missing
newsc0rp's `BigHeadline` uses a `useInView` hook for scroll-triggered fade-up. pr0ducent doesn't have this hook.

**Fix:** Create `src/hooks/useInView.ts` with IntersectionObserver logic.

---

## FILES TO CREATE/EDIT

| File | Action |
|------|--------|
| `src/assets/nav-icons/*.png` | Regenerate all 10 sketch icons with QA |
| `src/components/BrandText.tsx` | Create (copy from newsc0rp) |
| `src/components/BigHeadline.tsx` | Create (copy from newsc0rp) |
| `src/components/IllustDivider.tsx` | Create (copy from newsc0rp, no video support needed initially) |
| `src/hooks/useInView.ts` | Create (IntersectionObserver hook) |
| `src/index.css` | Add 6 missing wash/gradient classes |
| `src/components/PageFrame.tsx` | Fix dropdown positioning (move outside flex) |
| `src/pages/Index.tsx` | Add BigHeadline dividers, section washes, section-cv wrappers |
| `src/components/Footer.tsx` | Dark section treatment |
| `src/components/BuilderComparisonTable.tsx` | Add section wash class |
| `src/components/FeatureMatrix.tsx` | Add section wash + section-cv |
| `src/components/InlineCalculator.tsx` | Add section wash |
| `src/components/HomepageBlogSection.tsx` | Add section wash |

## WHAT STAYS THE SAME

- All backend/edge functions -- zero changes
- Route structure, auth flow, data fetching
- Tailwind config, design tokens, CSS variables
- Core component logic (forms, tables, experiments)

