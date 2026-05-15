// Shared helper: normalize GITHUB_RUN_ATTEMPT to a positive integer string.
//
// GITHUB_RUN_ATTEMPT is unset locally and can be empty/non-numeric in odd
// runner states. Always coerce to a positive integer (default 1) so any
// /attempts/<n> deep link is valid in every code path — including retry
// coalesced summaries and the update→create fallback ::notice::.
//
// Imported by every workflow step that builds run-attempt deep links so
// the fallback logic is defined exactly once.
function normalizeRunAttempt(raw) {
  const value = raw === undefined ? process.env.GITHUB_RUN_ATTEMPT : raw;
  const parsed = parseInt(value || '', 10);
  return String(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
}

module.exports = { normalizeRunAttempt };