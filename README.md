# IkLearnEdge

Canonical frontend lives in `app/` and backend lives in `backend/`.

## Workspace Layout
- `app/`: active React + Vite frontend
- `backend/`: Express + PostgreSQL API
- `backend/sql/`: schema and migration SQL for the current workflow

## Commands
- `npm run dev`: start the frontend from `app/`
- `npm run build`: build `app/` and sync the static output to root `dist/`
- `npm run preview`: preview the built frontend from `app/`
- `npm run start`: start the backend from `backend/`

## Booking Workflow
- Demo booking: student submits request, teacher accepts or rejects, acceptance requires a meeting link.
- Paid booking: student books, uploads receipt, admin verifies payment, teacher accepts or rejects with a meeting link.
- Notifications are persisted in the `notifications` table for both student and teacher workflow events.

## Notes
- The old duplicate root frontend is deprecated. Root scripts now delegate to `app/`.
- The unused `app/src/components/ui` kit has been removed from the active app.
