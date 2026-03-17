

# Prompt Lab — AI Builder Comparison Engine

## Overview
A "command center" SaaS demo where users enter one prompt, select multiple AI app-builder platforms, watch simulated parallel builds, and compare results side-by-side. Lovable is featured as the primary partner. All API calls are mocked but architected for future real integrations.

---

## Pages & Components

### 1. Landing Page (Hero + Config)
- **Prompt Textarea**: Large, centered, high-contrast input with "Initialize Experiment" CTA
- **Tool Selection Grid**: Checkbox grid with logos for 10+ builders (Lovable, Replit, v0, Cursor, Base44, Antigravity, Build0, Orchids, Floot, etc.). Lovable pre-selected with "Recommended Partner" badge
- **Account Model Toggle**: Segmented control — "Use My Accounts (OAuth)" vs "Use Broker Accounts (Instant Sandbox)"
- **Trust bar**: Participating tool logos, transparency note about referral model

### 2. Experiment Run / Comparison Canvas
- **Global progress bar**: "X/Y tools completed"
- **Lovable Featured Card**: `col-span-2`, indigo ring glow, "Recommended Partner" badge, larger preview area
- **Tool Tiles** (responsive grid): Each shows logo, live timer (`font-mono tabular-nums`), status badge (queued → running → completed with pulse animation), mock preview thumbnail, 4 metric bars (UI Quality, Backend Logic, Speed, Ease of Editing), "Continue in [Tool]" CTA
- **Filters**: Show/hide specific tools
- **Completion flash**: Green background pulse when a tool finishes

### 3. Tool Detail Panel
- Expanded modal/page with larger preview, editorial narrative (pros/cons), timeline of build progress, technical insights (stack, hosting), and prominent referral CTA "Continue Building in [Tool]"

### 4. Experiment History Dashboard
- List of past experiments: prompt snippet, date, tools used, link to reopen comparison canvas
- Simple card-based layout

---

## Data Architecture (Local State / Mocked)
- **Tools config**: TypeScript config array defining each tool (id, name, logo, featured flag, typical strengths, mock delay range)
- **Experiment state