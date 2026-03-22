

# Plan: Expand builder catalog, more prompt templates, fix visual issues

## Summary

Five changes addressing the user's complaints: (1) expand prompt templates, (2) expand builder list to 20+, (3) hide builder grid until user interacts, (4) fix section headers to be truly large, (5) fix background transitions between sections.

## 1. Expand prompt templates to 12+

**File:** `src/config/prompt-templates.ts`

Add more template categories beyond the current 7. New ones:
- CRM / Client Portal
- AI Chatbot
- Social Media Dashboard
- Booking / Scheduling App
- Learning Management System (LMS)
- Real Estate Listings
- Restaurant / Food Ordering
- HR / Recruitment Tool
- Event Management
- Invoice / Billing Tool
- Health & Wellness App
- Community Forum

Show first 7 as chips above input. Add a "More templates" expandable row or small dropdown that reveals remaining templates.

## 2. Expand builder catalog to 20+ tools

**File:** `src/config/tools.ts`

Based on research, add the following builders to `BUILDER_TOOLS` (currently 10):
- Windsurf (Codeium IDE)
- GitHub Copilot
- Claude Code
- Emergent.sh
- Aider
- Zed.dev
- Codeium (free assistant)
- Tabnine
- Amazon Q Developer
- Gemini Code Assist
- Continue.dev
- Sourcegraph / Cody
- Canva Code / A0.dev
- Devin
- Tempo Labs
- Dora AI

This brings total to ~25 builders. Each with proper `id`, `name`, `logoUrl` (Google favicon proxy), `featured: false`, `strengths`, `description`, `mockDelayRange`, `stack`, `hosting`, `pricing`, `category`.

## 3. Hide builder grid until user interaction

**File:** `src/components/HeroSection.tsx`

- Track a `showBuilders` state, initially `false`
- Set `showBuilders = true` when:
  - User types anything in the textarea (`onChange`)
  - User clicks a prompt template chip
- The `ToolSelectionGrid` + submit button are wrapped in an animated container that only renders when `showBuilders` is true
- Use framer-motion `AnimatePresence` for smooth reveal

## 4. Fix section headers to be truly large (like murd0ch.com)

The current headers use `clamp(2.4rem, 5vw + 0.5rem, 5rem)` which is too small. murd0ch.com uses massive serif headings at roughly `clamp(3rem, 6vw + 1rem, 7rem)`.

**Files:** `BuilderComparisonTable.tsx`, `FeatureMatrix.tsx`, `PlanComparisonTable.tsx`, `InlineCalculator.tsx`, `FAQ.tsx`, `HomepageBlogSection.tsx`

- Increase all section h2 sizes to `clamp(3rem, 6vw + 1rem, 7rem)`
- Ensure the FAQ title also uses this size (currently `text-3xl md:text-4xl` which is much smaller)

## 5. Fix background transitions (no visible "cuts")

**File:** `src/index.css` and `src/pages/Index.tsx`

The problem: each section has a hard-edged background class (`section-gradient-peach`, `section-wash-blush`, etc.) creating visible seams between sections.

Solution:
- Add generous vertical padding overlap between sections: `py-20 md:py-32` on each section
- Add pseudo-element gradient fades at top/bottom of each wash class to blend into the neutral page background
- In CSS, add `::before` and `::after` on section-wash/gradient classes with ~80px tall transparent-to-wash gradient overlaps
- Alternatively, use a single ambient background approach with the `.gradient-canvas` and remove per-section backgrounds, relying on subtle section-level tints via very low-opacity overlays

The murd0ch.com approach: the page uses one continuous ambient gradient wash behind the entire page (peach/rose/gold), and sections don't have individual backgrounds. Instead the content just flows over the continuous gradient.

**Approach for pr0ducent:**
- Keep the `gradient-canvas` fixed background as the primary atmosphere
- Remove or dramatically reduce opacity of per-section backgrounds (`section-gradient-peach`, `section-wash-blush`, etc.) so they become barely-visible tints rather than distinct bands
- Add CSS transitions between sections using 80px gradient "bleed" pseudo-elements

## 6. Nav icon display improvements

**File:** `src/components/PageFrame.tsx`

The nav icons currently use basic `<img>` with `invert` class for active state. To make them "prettier" like murd0ch.com:
- Increase icon sizes slightly (28px default, 36px in mobile)
- Remove the harsh `invert` filter on active items; instead use `opacity-100` with a subtle drop-shadow
- Add a gentle hover scale transform `group-hover:scale-110`

## Technical details

- All changes are CSS/component-level, no database or backend changes needed
- Builder catalog additions are static fallbacks in `tools.ts`; the DB merge via `BuilderCatalogProvider` continues to work as before
- The `ToolSelectionGrid` already uses `useBuilderCatalog()` so it will automatically show all 25 builders once `tools.ts` is expanded

