

## Full Layout, Navigation & Visual Consistency Overhaul

### Problem Summary

After auditing every page and comparing with the murd0ch/newsc0rp_p0xi reference:

1. **Frame not visible** — margins too small (8-16px), need 20-32px so the 2px border reads clearly with space to screen edge
2. **App.css conflicts** — `#root { max-width: 1280px; padding: 2rem; text-align: center }` fights with page-frame layout
3. **Footer missing nav parity** — dropdown has Home, Arena, Leaderboard, Compare, Calculator, Pricing, Blog, Runs Now, Marketplace, FAQ. Footer only has a subset
4. **No IllustDivider usage** — component exists but is never rendered; murd0ch uses 5+ illustrated dividers with video animations between sections
5. **Zero `<video>` elements** — murd0ch has animated MP4 illustrations (press, clockwork, globe, typewriter, armillary)
6. **Auth, PublicExperiment, NotFound lack PageFrame** — no consistent frame/nav on these pages
7. **UserDashboard missing Footer** — dialogs render after `</PageFrame>`, Footer is absent
8. **IntegrationStatus missing AmbientBackground**
9. **glass-card + backdrop-blur still widespread** — violates "Solid UI" design system rule
10. **Sparse subpages** — Compare, Calculator, BuildersIndex, Leaderboard, Arena, Docs lack visual richness (no illustrations, dividers, or section washes between content blocks)

---

### Plan

#### 1. Fix frame spacing & remove App.css conflicts
- **App.css**: Delete conflicting `#root` styles (max-width, padding, text-align)
- **index.css `.page-frame`**: Increase margins: `mx-4 sm:mx-5 md:mx-6 lg:mx-auto` with explicit `my-4 sm:my-5 md:my-6`
- **PageFrame.tsx**: Update wrapper class to match new spacing
- **sticky-header**: Adjust `top` offsets to match new margins

#### 2. Footer: mirror dropdown menu 1:1
- Replace current 4-column layout with a flat link list matching all `navLinks` from PageFrame
- Items: Home, Arena, Leaderboard, Compare, Calculator, Pricing, Blog, Runs Now, Marketplace (if FF enabled), FAQ, Docs
- Keep brand column + language toggle + copyright row

#### 3. Upgrade IllustDivider with video support
- Port the `video` prop pattern from newsc0rp_p0xi reference
- Video plays inline, muted, looped, replaces static image when loaded
- Intersection Observer for lazy loading (only load when near viewport)

#### 4. Add visual rhythm to homepage
- Between BuilderComparisonTable and FeatureMatrix: `BigHeadline` + `IllustDivider` using existing `caricature-claude.png`
- Between PlanComparisonTable and InlineCalculator: `BigHeadline`
- Between InlineCalculator and FAQ: `IllustDivider`
- Use existing illustration assets from `src/assets/`

#### 5. Wrap Auth, PublicExperiment, NotFound in PageFrame
- **Auth.tsx**: Wrap in `<AmbientBackground /> + <PageFrame>`, keep centered form
- **PublicExperiment.tsx**: Replace custom header with PageFrame, add Footer
- **NotFound.tsx**: Wrap in PageFrame + AmbientBackground + Footer

#### 6. Fix missing Footer/AmbientBackground
- **UserDashboard.tsx**: Add `<Footer />` before closing `</PageFrame>` (move dialogs inside)
- **IntegrationStatus.tsx**: Add `<AmbientBackground />`

#### 7. Eliminate glass-card + backdrop-blur violations
- Replace `glass-card` with `bg-card border border-border/50 rounded-xl shadow-sm` across:
  - HeroSection template chips and builder selection
  - Calculator weight sliders card
  - UserDashboard experiment/rating/subscription cards
  - HowItWorks step cards
  - RunComments
- Remove `backdrop-blur` from non-overlay contexts (GuestOrchestrationBanner, RunCenter, PublicExperiment header)
- Keep `backdrop-blur` only on: mobile menu overlay, fullscreen preview overlay (these are true overlays)

#### 8. Add section washes to sparse subpages
- **Compare.tsx**: Wrap comparison table in `section-gradient-peach`, CTA in `section-wash-gold`
- **Calculator.tsx**: Wrap sliders in `section-wash-blush`, results in `section-gradient-peach`
- **BuildersIndex.tsx**: Add `section-wash-indigo` to grid area
- **Leaderboard.tsx**: Wrap table in `section-gradient-lavender`
- **Arena.tsx**: Wrap arena in `section-gradient-rose`
- **DeveloperPortal.tsx**: Wrap tabs in `section-wash-teal`

---

### Technical Details

**Files modified** (~18 files):

| File | Changes |
|------|---------|
| `src/App.css` | Remove conflicting `#root` styles |
| `src/index.css` | Increase page-frame margins, adjust sticky-header top offsets |
| `src/components/PageFrame.tsx` | Update margin classes |
| `src/components/Footer.tsx` | Rewrite to mirror dropdown menu items 1:1 |
| `src/components/IllustDivider.tsx` | Add video prop with IntersectionObserver |
| `src/pages/Index.tsx` | Add BigHeadline + IllustDivider between sections |
| `src/pages/Auth.tsx` | Wrap in PageFrame + AmbientBackground |
| `src/pages/PublicExperiment.tsx` | Replace custom header with PageFrame, add Footer |
| `src/pages/NotFound.tsx` | Wrap in PageFrame + AmbientBackground + Footer |
| `src/pages/UserDashboard.tsx` | Fix Footer placement |
| `src/pages/IntegrationStatus.tsx` | Add AmbientBackground |
| `src/pages/Compare.tsx` | Add section washes |
| `src/pages/Calculator.tsx` | Add section washes, replace glass-card |
| `src/pages/BuildersIndex.tsx` | Add section wash |
| `src/pages/Leaderboard.tsx` | Add section wash |
| `src/pages/Arena.tsx` | Add section wash |
| `src/pages/DeveloperPortal.tsx` | Add section wash |
| `src/components/HeroSection.tsx` | Replace glass-card with solid bg-card |

**No database changes needed.**

