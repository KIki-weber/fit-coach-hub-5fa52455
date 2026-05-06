## Plan: Smooth-scroll landing, hero swap, and progress tracking with previous/current photos

### 1. One-page smooth-scroll landing (`src/pages/Index.tsx`)
- Import the section content of `About`, `Nutrition`, `Training`, `Service`, and `Contact` and render them inline as `<section id="...">` blocks (home, about, nutrition, training, services, trainers, contact).
- Keep the existing route pages working but the navbar links will use hash anchors (`/#about`, `/#nutrition`, etc.).
- Update `src/components/Navbar.tsx` so each nav item scrolls smoothly to its section. Active link highlights based on the section in view (IntersectionObserver). `html { scroll-behavior: smooth }` is already set in `index.css`; add `scroll-margin-top` to each section so the fixed header doesn't cover content.

### 2. Hero photo fixes
- In the hero block, add top padding/margin (`pt-24 md:pt-32`) so the header never overlaps the hero photo.
- Replace every reference to `src/assets/hero-fitness.jpg` with `src/assets/hero-fitness4.jpg` and delete `hero-fitness.jpg`.

### 3. "Our Trainers" section on landing — featured user progress
- New section `#trainers` on Index showing all users whose progress is publicly featured.
- Pulls from `progress_tracking` rows where the user's profile has `progress_public = true`. Shows current photo, name, and a small before/after compare.
- If no users are featured, show a friendly placeholder.

### 4. Admin dashboard — view & toggle user progress
- New admin page section `AdminProgressManager` listing each user with:
  - their latest progress entry (previous + current photo, height, weight, notes, computed delta),
  - a switch to **Activate / Deactivate** public visibility on the trainers section.
- Default for every user: **deactivated** (privacy).
- Reuses existing admin sidebar styling.

### 5. Progress Tracking page — previous vs current photo
- The form now has two slots: **Previous photo** (auto-filled with the last entry's current photo, read-only preview) and **Current photo** (user uploads new).
- On submit: store `previous_photo_url` (= last entry's current photo) and `photo_url` (= newly uploaded current).
- Show a side-by-side "Previous → Now" comparison card per entry, plus a delta line (e.g., `-1.2 kg since last entry`).
- Auto-fill height/weight from profile remains.

### 6. Database changes
- `profiles`: add `progress_public boolean default false`.
- `progress_tracking`: add `previous_photo_url text`.
- RLS:
  - Public (anon) `SELECT` on `progress_tracking` only for users whose profile has `progress_public = true` (via a security-definer helper).
  - Public `SELECT` on a minimal projection of `profiles` (full_name, photo_url) only when `progress_public = true`.
  - Admin already has full access via existing `has_role` policies; add `UPDATE` policy on `profiles` for admins so they can flip the flag.

### Technical notes
- New admin component: `src/components/admin/AdminProgressManager.tsx` registered in `AdminSidebar` + `Admin.tsx`.
- New landing component: `src/components/landing/TrainersSection.tsx`.
- `Navbar.tsx`: replace route `Link`s with anchor scroll handlers; on non-Index routes, navigate to `/` then scroll.
- Add `scroll-mt-24` utility on each section.
- Migration adds the two columns + the additional RLS policies; existing rows get `progress_public = false`.

### Out of scope
- Auth flows, payments, language/i18n changes, and the messaging/booking modules are untouched.
