// Tuning knobs for matrix dot display — the ONLY place display policy is set.
// Expected to change as usage grows/shrinks; revisit these first (2026-08-25:
// set to indefinite/90 to make the matrix more interesting during early low uptake).
//
// VISIBILITY_DAYS: how long a dot appears on the matrix at all.
//   null = show ALL dots indefinitely (server returns the full archive).
//   ⚠️ null makes every /api/dots poll fetch the whole archive — fine at current
//   volume; set back to a number (e.g. 90) if Upstash free-tier usage gets heavy.
//
// COLOR_WINDOW_DAYS: dots newer than this render at 50% opacity in the user's
//   chosen color; older dots render 15% gray, behind the colored ones.
export const VISIBILITY_DAYS: number | null = null
export const COLOR_WINDOW_DAYS = 90
