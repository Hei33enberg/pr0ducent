

## Fix: Navigation, Footer Links, Layout Consistency Across All Views

### Problem Summary

1. **Anchor links broken in footer**: `#how-it-works` and `#faq` are plain `<a>` tags without SPA navigation -- they don't work from subpages
2. **Missing Footer** on 6 pages: Arena, Leaderboard, Calculator, RunsNow, BuildersIndex, Marketplace, Compare
3. **Missing AmbientBackground** on 5 pages: Blog, BlogPost, Notifications, BuilderDashboard, Leaderboard, Compare
4. **Inconsistent inner containers**: Some pages use `page-inner`, others use ad-hoc `max-w-*` with varying padding
5. **Heading styles inconsistent**: Some pages use small `text-3xl` headings instead of the editorial `clamp()` sizing
6. **`glass-card` with backdrop effects** still present on some components despite "Solid UI" design system rule

---

### Plan

#### 1. Fix footer anchor links (Footer.tsx)
- Replace plain `<a href="#how-it-works">` and `<a href="#faq">` with onClick handlers that:
  - If on homepage (`/`): smooth-scroll to section
  - If on subpage: `navigate("/#faq")` or `navigate("/#how-it-works")` -- then scroll after navigation

#### 2. Fix nav anchor handling (PageFrame.tsx)
- In `handleAnchorClick`: the current code does `navigate("/" + href)` which produces `"/" + "#faq"` = `"/#faq"` -- verify this works with ScrollToTop resetting scroll. May need to add hash-scroll logic in ScrollToTop or Index.

#### 3. Add hash-scroll support (ScrollToTop.tsx or Index.tsx)
- After navigating to `/#faq`, detect `location.hash` and scroll to that element after page renders

#### 4. Add Footer to all subpages missing it
Files to update:
- `src/pages/Arena.tsx` -- add Footer import + render
- `src/pages/Leaderboard.tsx` -- add Footer
- `src/pages/Calculator.tsx` -- add Footer
- `src/pages/RunsNow.tsx` -- add Footer
- `src/pages/BuildersIndex.tsx` -- add Footer
- `src/pages/Compare.tsx` -- add Footer
- `src/pages/Marketplace.tsx` -- add Footer (check if present)

#### 5. Add AmbientBackground to pages missing it
Files to update:
- `src/pages/Blog.tsx` -- wrap in `min-h-screen` div + AmbientBackground
- `src/pages/BlogPost.tsx` -- same
- `src/pages/Notifications.tsx` -- same
- `src/pages/BuilderDashboard.tsx` -- same
- `src/pages/Leaderboard.tsx` -- already has wrapper but no AmbientBackground
- `src/pages/Compare.tsx` -- no AmbientBackground

#### 6. Standardize page containers
Normalize all subpages to use `page-inner` class instead of custom padding/max-width:
- `src/pages/RunsNow.tsx`: `max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10` --> `page-inner`
- `src/pages/BuildersIndex.tsx`: `max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10` --> `page-inner`
- `src/pages/BuilderProfile.tsx`: custom padding --> `page-inner`

#### 7. Standardize heading typography
Ensure all page `<h1>` elements use the editorial serif style with `clamp()` sizing consistent with the design system:
- Arena, Leaderboard, Compare, RunsNow, BuildersIndex, Calculator pages -- upgrade headings to match `font-serif font-bold tracking-[-0.02em]` with appropriate `clamp()` font-size

---

### Technical Details

**Files modified** (~12 files):
- `src/components/Footer.tsx` -- anchor link SPA handling
- `src/components/ScrollToTop.tsx` -- hash-scroll support
- `src/pages/Arena.tsx` -- Footer, heading style
- `src/pages/Leaderboard.tsx` -- AmbientBackground, Footer, heading style
- `src/pages/Calculator.tsx` -- Footer
- `src/pages/RunsNow.tsx` -- Footer, container class
- `src/pages/BuildersIndex.tsx` -- Footer, container class, heading style
- `src/pages/Compare.tsx` -- AmbientBackground, Footer
- `src/pages/Marketplace.tsx` -- Footer (verify)
- `src/pages/Blog.tsx` -- AmbientBackground wrapper
- `src/pages/BlogPost.tsx` -- AmbientBackground wrapper
- `src/pages/BuilderDashboard.tsx` -- AmbientBackground wrapper
- `src/pages/BuilderProfile.tsx` -- container normalization

**No database changes needed.**

