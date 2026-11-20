# Gender Reveal RSVP

A mobile-first RSVP site for a gender reveal party. The Vue 3 frontend communicates only with an Express API; the backend uses Supabase with its service-role key and protects guest data behind admin authentication.

## Project structure

```text
frontend/                 Vue 3 + Vite landing, invitation, confirmation, and admin pages
  src/config/event.js     Local event details, parents' message, and ultrasound images
  src/pages/              Landing, celebration, RSVP, thank-you, and admin pages
  src/services/api.js     Backend API client
  src/styles/             Responsive design system
backend/                  Express API, deployable as Vercel serverless functions
  api/                    Vercel catch-all function
  src/controllers/        API request handlers
  src/lib/                Server-side Supabase client
  src/middleware/         Admin auth, RSVP validation, and rate limiting
  src/routes/             RSVP and admin routes
  src/services/           Supabase queries
supabase/schema.sql       Database schema and row-level security
```

## Local setup

Prerequisites: Node.js 20+ and npm.

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in its SQL Editor.
2. Configure and start the backend:

   ```sh
   cd backend
   npm install
   # Create backend/.env with the variables listed below.
   npm run dev
   ```

   The API runs at `http://localhost:3001`.
3. Configure and start the frontend in another terminal:

   ```sh
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```

   The site runs at `http://localhost:3000`. Vite proxies `/api` requests to the local backend.
4. Edit parent names, the landing-page last name, parents' message, gallery captions/image paths, and placeholder event details in `frontend/src/config/event.js`. Update the single row in Supabase `public.event_settings` for deployed event information. For example:

   ```sql
   update public.event_settings
   set parent_one = 'Parent One',
       parent_two = 'Parent Two',
       event_date = '2027-06-12',
       event_time = '14:00',
       venue_name = 'The Garden Hall',
       venue_address = '123 Celebration Lane',
       rsvp_deadline = '2027-05-29',
       dress_code = 'Come as you are; pink and blue are welcome.'
   where id = 1;
   ```

   The frontend config in `frontend/src/config/event.js` supplies placeholder details locally. Values saved in Supabase take precedence when the API is available.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Private service-role key; backend only |
| `ADMIN_PASSWORD` | Yes | Password for `/admin` and protected admin API endpoints |
| `ALLOWED_ORIGIN` | Yes in deployment | Exact frontend origin, such as `https://your-site.vercel.app` |
| `PORT` | No | Local API port (defaults to `3001`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | No locally; yes in deployment | Backend origin, such as `https://your-api.vercel.app`; do not include `/api` |

Keep local `.env` files out of source control. Never put Supabase credentials in the frontend.

## API

- `GET /api/event` — public event details
- `POST /api/rsvp` — submit one RSVP per email; validated and rate-limited
- `GET /api/admin/rsvps` — private guest list
- `GET /api/admin/stats` — private RSVP totals
- `GET /api/admin/export` — private CSV export

Admin requests use `Authorization: Bearer <ADMIN_PASSWORD>`. The `/admin` page prompts for this password and keeps it in memory while loading the dashboard. RSVP fields are validated by the backend, duplicate email addresses receive HTTP 409, and requests to `POST /api/rsvp` are rate-limited.

The RSVP form collects full name, email, attendance, guest count (1–10 when attending), and team guess; phone and a message are optional. Declined responses are stored with a guest count of zero. Dashboard totals distinguish RSVP responses from the total number of attending guests.

## Invitation flow and images

- `/` is the cover page with **Open Invitation** and **RSVP Now** buttons.
- `/celebrate` contains the parents' message, ultrasound gallery, event information, and RSVP form.
- `/thank-you` confirms a submitted RSVP; `/admin` is the private guest list.
- Add ultrasound files to `frontend/public/images/ultrasound/` and use their public paths in `ultrasoundImages` in `frontend/src/config/event.js` (for example, `/images/ultrasound/ultrasound-1.jpg`). Replace the sample entries or add more with `src`, `alt`, and `caption`. The gallery shows a friendly placeholder when a file is absent. Resize/compress images before adding them; avoid unnecessarily large originals.
- Edit the short parents' message and event detail defaults in `frontend/src/config/event.js`. Database event details take precedence when available; the parents' message and gallery are configured in the frontend.

## Deploy

1. **Create Supabase project:** create a project, open SQL Editor, and run [`supabase/schema.sql`](./supabase/schema.sql). If the RSVP table already exists, also run the supplied SQL migration in `supabase/migrations/`. Add the parents, date, time, venue, address, RSVP deadline, and dress code to the single `event_settings` row.
2. **Deploy the backend:** create a Vercel project connected to this repository and set its Root Directory to `backend`. Add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, and `ALLOWED_ORIGIN` to the backend project's environment variables. Set `ALLOWED_ORIGIN` to the final frontend origin. Deploy and note the backend URL.
3. **Deploy the frontend:** create a second Vercel project for this repository and set its Root Directory to `frontend`. Add `VITE_API_URL` with the deployed backend origin (without `/api`), then deploy.
4. Confirm the frontend URL exactly matches the backend's `ALLOWED_ORIGIN`, and test a guest RSVP and `/admin`. The pages are responsive and support modern mobile browsers; use an HTTPS backend URL for the deployed site. The service-role key and admin password stay in backend environment settings, never in the frontend.

Run `npm run build`, `npm run lint`, and `npm test` from `backend/` to verify the API. Run `npm run lint` and `npm run build` from `frontend/` to verify the UI.
