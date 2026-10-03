# Salon Lepote Still – Website + Admin Panel

## Included changes
- Updated Serbian copy highlighting **30 godina tradicije**.
- Added full **Cenovnik** with the prices supplied by the salon (RSD).
- Added the supplied exterior/location photo at `images/location.webp`.
- Added a dedicated location section with Google Maps button.
- Added a working `/admin/` service/price management UI.
- Added Supabase integration files (`config.js`, `supabase.sql`).
- Existing `CNAME`, SEO files, favicon, gallery and videos are preserved.

## Admin panel
Open `/admin/`.

If Supabase is not configured, the panel runs in **Demo mode** and saves changes only in the current browser.
For live editing that updates the public website for everyone:
1. Create a Supabase project.
2. Run `supabase.sql` in Supabase SQL Editor.
3. Create the salon admin user in Authentication > Users.
4. Put the Supabase project URL and **anon public key** in `config.js`.
5. Deploy the updated files to GitHub Pages.

Do not put a Supabase service-role key in the website. The browser must use the anon public key and RLS must remain enabled.
