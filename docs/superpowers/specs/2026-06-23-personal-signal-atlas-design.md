# Personal Signal Atlas: Phase 1 Design

## Goal

Turn the homepage from a polished template into a clear portrait of its owner: a person who builds things and pays attention to everyday life.

The first phase adds three connected modules:

1. **Now Dashboard**: what Lux is doing, reading, and thinking about now.
2. **Life Postcards**: a small set of curated public memories.
3. **Featured Project**: one project shown with context, progress, and a useful next action.

The site remains static, Markdown/MDX-first, bilingual, fast, and deployable on the existing Astro/Vercel setup.

## Audience And Tone

- Primary audience: Lux, returning over years to review life and work.
- Secondary audience: friends, collaborators, and visitors learning who Lux is.
- Main language: simple English that a middle-school student can understand.
- Supporting language: short Chinese labels and sentences where they add warmth or clarity.
- Public life content is curated. Do not expose exact addresses, live location, private schedules, or raw coordinates.

## Experience

### Homepage Story

The homepage should answer three questions within the first viewport:

1. What is Lux doing now?
2. What kind of things does Lux make?
3. What does Lux notice and care about in daily life?

The existing hero remains the identity anchor. Directly below it, the three new modules form a varied editorial layout rather than three identical cards.

### Now Dashboard

The Now module is a compact status board with three fields:

- **Making**: the main current project or activity.
- **Reading**: one current book, paper, or topic.
- **Thinking**: one question or idea worth returning to.

Content comes from the singleton collection entry `src/content/now/index.mdx`. Frontmatter becomes the structured summary; the MDX body remains available for the full `/now` page. The homepage links to `/now` for detail.

The module shows a visible "updated" date so stale information is honest rather than pretending to be live.

### Life Postcards

The homepage shows up to three newest published Life entries. A postcard contains:

- photo when available;
- title and short description;
- date and broad location;
- optional mood or weather;
- link to the Life detail page.

When an entry has no photo, it uses a strong typographic fallback with the same stable aspect ratio. The layout must not collapse or look unfinished.

Coordinates are never rendered. Location text should stay broad, such as a city, district, park, museum, or public venue.

### Featured Project

One Lab entry is marked `featured: true`. The homepage project module shows:

- project title and plain-language description;
- current status;
- technology stack;
- screenshot when available;
- primary action: open demo, read write-up, or view repository, in that order.

If no project is explicitly featured, use the newest published Lab entry. If the Lab collection is empty, show a small "next build" placeholder linking to `/lab`.

## Visual Design

Both existing themes remain first-class:

- **Paper**: warm off-white background, ink borders, quiet color, comfortable reading.
- **Terminal**: dark background, cool lines, stronger signal colors, project-focused energy.

The modules share structure but may use theme-specific color treatments. They must not become three matching cards. Recommended composition:

- Now Dashboard: compact ruled status board.
- Life Postcards: horizontal film or postcard strip.
- Featured Project: wider project showcase with media and text in one unframed section.

Use motion only for hover/focus feedback. Respect `prefers-reduced-motion`. Preserve the current 8px maximum card radius and avoid nested cards.

## Content Model Changes

### Now

Define a structured singleton schema for `src/content/now/index.mdx`:

```yaml
updated: 2026-06-23
making: "Building my Personal Signal Atlas"
reading: "A book or topic"
thinking: "A current question"
```

### Lab

Add an optional field with a default:

```yaml
featured: false
```

### Life

No schema change is required. Continue using `photos`, `location`, `weather`, `mood`, and `description`. Exact coordinates remain stored only when useful for future private tooling and are not displayed.

## Component Boundaries

- `NowDashboard.astro`: reads prepared Now data through props and renders only the compact summary.
- `LifePostcards.astro`: receives a list of published Life entries and owns photo/fallback presentation.
- `FeaturedProject.astro`: receives one selected Lab entry and decides the safest available action link.
- `src/lib/content.ts`: owns featured-project selection and any reusable published-entry filtering.
- `src/pages/index.astro`: fetches content, prepares module props, and composes the page. It should not contain detailed module markup.
- `src/pages/now.astro`: renders the same singleton source as a full page, avoiding duplicate hard-coded status text.

## Data Flow

1. Astro validates Markdown/MDX frontmatter at build time.
2. The homepage loads the Now singleton and the Life/Lab collections.
3. Draft entries are removed using existing publication helpers.
4. Life entries are sorted newest-first and limited to three.
5. The featured Lab entry is selected explicitly, then falls back to newest.
6. Components receive prepared data and render static HTML.

No browser API, external service, database, analytics service, or client-side fetch is required.

## Empty And Error States

- Missing Now data: show "Status update in progress / 近况整理中" and keep `/now` usable.
- Life entry without photo: render a fixed-ratio typographic postcard.
- No Life entries: link to `/life` with a quiet empty state.
- Featured Lab entry without screenshot: use a fixed-ratio project blueprint treatment.
- No Lab entries: show "Next build loading" and link to `/lab`.
- Invalid frontmatter: fail the build with Astro's content-schema error.

## Accessibility

- Every photo has meaningful alt text derived from the entry title, never a filename.
- Module headings follow the page heading hierarchy.
- Links describe their destination or action.
- Status is not communicated by color alone.
- Keyboard focus remains visible in Paper and Terminal themes.
- Text and controls remain usable at 390px width and 200% zoom.

## Testing And Acceptance

Automated checks:

- content-schema tests for the Now fields and Lab `featured` field;
- unit tests for featured-project selection and fallback;
- component/source contract tests for photo fallbacks and accessible labels;
- existing full Vitest suite;
- `npm run build` with zero Astro errors and warnings.

Browser checks:

- desktop and 390px mobile layouts;
- Paper and Terminal themes;
- no horizontal overflow;
- theme choice still persists;
- Life no-photo fallback has stable dimensions;
- homepage links reach `/now`, Life detail, and the selected project action.

Phase 1 is accepted when a new visitor can identify Lux's current focus, one meaningful project, and selected slices of daily life without scrolling through a generic article list.

## Out Of Scope

- draggable desktop windows;
- external weather or location APIs;
- comments, accounts, likes, or visitor profiles;
- live activity tracking;
- public map coordinates;
- a complete year timeline;
- automatic relationship graphs between every content type.

The year timeline and cross-content relationships are strong Phase 2 candidates after the three new modules have enough real content.
