// Shared helper: validate + normalize the `bun_cache_dir` workflow input.
//
// Returns { ok: true, value } on success, { ok: false, error } on failure.
// `value` is "" when the input is blank/unset (caller should fall back to
// the default ~/.bun/install/cache). Otherwise `value` is an absolute,
// normalized POSIX path with `~` expanded, repeated `/` collapsed, and
// trailing `/` stripped.
//
// Validation rules (applied to the trimmed raw value):
//   - blank → ok with value: ""
//   - rejects null bytes
//   - rejects embedded newlines (\n, \r)
//   - rejects length > 4096
// Validation rules (applied to the normalized value):
//   - must be absolute (starts with `/`)
//   - must not contain a `..` path segment

function normalizeBunCacheDir(raw, opts = {}) {
  const home = opts.home ?? process.env.HOME ?? '';
  const trimmed = String(raw ?? '').replace(/^\s+|\s+$/g, '');
  if (trimmed === '') return { ok: true, value: '' };

  if (trimmed.includes('\0')) {
    return { ok: false, error: 'bun_cache_dir contains a null byte' };
  }
  if (/[\n\r]/.test(trimmed)) {
    return { ok: false, error: 'bun_cache_dir must not contain newlines' };
  }
  if (trimmed.length > 4096) {
    return { ok: false, error: 'bun_cache_dir exceeds 4096 characters' };
  }

  // Expand leading ~ or ~/
  let normalized = trimmed;
  if (normalized === '~' || normalized.startsWith('~/')) {
    normalized = home + normalized.slice(1);
  }
  // Collapse repeated /
  normalized = normalized.replace(/\/{2,}/g, '/');
  // Strip trailing / (preserve lone "/")
  while (normalized.length > 1 && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  if (!normalized.startsWith('/')) {
    return {
      ok: false,
      error: `bun_cache_dir must resolve to an absolute path (got normalized: '${normalized}')`,
    };
  }
  const segments = normalized.split('/');
  if (segments.includes('..')) {
    return {
      ok: false,
      error: `bun_cache_dir must not contain '..' segments (got normalized: '${normalized}')`,
    };
  }

  return { ok: true, value: normalized };
}

module.exports = { normalizeBunCacheDir };
