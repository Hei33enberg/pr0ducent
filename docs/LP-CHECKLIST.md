# Landing page checklist (pr0ducent) — before returning to backend work

Short guide: what to close on the landing page before you return to the **builder stream**, queue, and core product.

---

## Product difference vs murd0ch (important)

| | **pr0ducent** | **murd0ch.com** |
|--|----------------|-----------------|
| LP goal | **Fast action:** prompt + builder choice is the heart of the page | **Story:** trust, narrative, long scroll |
| What is “focal” | Prompt field, templates, running a test — **as high as possible** in the first screen | Sections, illustrations, clips, CTA after context |

**Shared stable** = same visual language (typography, `page-frame` shell, glass, wash-e). We **do not** copy murd0ch **content layout** 1:1 on pr0ducent — the business goal differs. Shell + metrics: [`CROSS-PRODUCT-SHELL.md`](./CROSS-PRODUCT-SHELL.md).

**Sanity check:** *In the first screen, is it obvious the user should enter an idea and launch builders?*

---

## Smoke before publish

- [ ] **Logo** — does not stick to the top/left edge of the frame; same as the bar when the mobile menu opens; readable size (`clamp` in `PageFrame`), header does not break.
- [ ] **Hero** — on phone: order (**`HeroSection`**): headline → **caricature** → chips → field + builders; H1 and art fill space but **chips + input** stay in one predictable block (no artificial `min-h` on the illustration column).
- [ ] **Sticky header** — does not cover the hero headline on scroll / anchors (`scroll-margin` on hero).
- [ ] **Menu** — desktop: dropdown scrolls when many items; mobile: full screen, close control, language at bottom.
- [ ] **CTA** — “Get Started” goes where you agreed (e.g. pricing / auth).

---

## Content and automation (crons / jobs)

- [ ] Single source of truth for content (e.g. blog: CMS, markdown in repo, Supabase — **one place**).
- [ ] If there are crons (blog sync, RSS, etc.): **where they run** (GitHub Actions / Supabase cron / manual at first) and who owns them after deploy.
- [ ] LP placeholders replaced with final copy or marked “WIP”.

---

## Deploy (Lovable / hosting)

1. Pull from GitHub (`main`).
2. Build (locally `npm ci && npm run build` or build in Lovable).
3. Publish.

**Migrations / Edge:** only if this iteration changed the database or functions — then use a separate checklist in `docs/DEVELOPMENT-STATUS.md` or a dedicated handoff.

---

## After LP — backend / core

Short note for later: **builder result stream**, queue (`process-task-queue`), realtime — per `docs/ORCHESTRATOR.md` and your team roadmap.

---

## Related docs

- Shared shell: [`CROSS-PRODUCT-SHELL.md`](./CROSS-PRODUCT-SHELL.md)
- Visual parity and asset gaps: [`PR0DUCENT-PARITY-GAPS.md`](./PR0DUCENT-PARITY-GAPS.md)
- Shared design system (master in newsc0rp): [`NEWSCORP-DESIGN-SYSTEM.md`](./NEWSCORP-DESIGN-SYSTEM.md)
