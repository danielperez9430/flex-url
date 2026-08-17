/**
 * Encoding contract (mirrored by the PHP package — do not change without
 * updating both, plus `fixtures/cases.json`):
 *
 * - Structural brackets (`filter[attr][op]`) and the comma that separates
 *   multiple values in a list (`filter[status]=published,draft`) are emitted
 *   RAW on output — this matches apiable's own idiom and its generated
 *   pagination links.
 * - Every individual value is percent-encoded with `encodeURIComponent`
 *   *before* being joined into a list. Because `encodeURIComponent` escapes
 *   `,`, `[`, `]`, ` `, `&`, `=`, `%` and non-ASCII characters, a literal
 *   comma/bracket/space/etc. *inside* one value can never be confused with
 *   the raw commas/brackets we use as structural separators.
 * - Parsing is the exact inverse: values are split on RAW commas first
 *   (never on a decoded/`%2C` comma), then each piece is individually
 *   `decodeURIComponent`-ed. Keys are decoded as a whole before their
 *   bracket structure is parsed, so `filter[status]` and the percent-encoded
 *   `filter%5Bstatus%5D` (as used by apiable's own pagination links) both
 *   parse identically.
 * - `=` is never assumed inside a key/value pair until *after* splitting on
 *   the first raw `=` — decoding before splitting (a v1 bug) would let an
 *   encoded `%3D` inside a value be mistaken for the key/value separator.
 */

/** Percent-encode a single scalar value for the wire. */
export function encodeValue(value: string): string {
  return encodeURIComponent(value);
}

/** Percent-decode a single scalar value read off the wire. Never throws. */
export function decodeValue(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    // Malformed percent-escape: fall back to the raw text rather than throwing,
    // so a single bad param can't blow up parsing the rest of the URL.
    return raw;
  }
}

/** Encode a list of values into their raw-comma-joined wire representation. */
export function encodeList(values: readonly string[]): string {
  return values.map(encodeValue).join(',');
}

/**
 * Split a raw (still percent-encoded) value on literal commas — never on a
 * decoded `%2C` — then decode each resulting piece individually. An empty
 * raw string yields an empty list rather than `['']`.
 */
export function decodeList(raw: string): string[] {
  if (raw === '') return [];

  return raw.split(',').map(decodeValue);
}

/** Encode a single key segment (attribute/type/operator name) for use inside brackets. */
export function encodeKeySegment(segment: string): string {
  return encodeURIComponent(segment);
}

/**
 * Build a bracketed wire key, e.g. `buildKey('filter', ['due_at', 'gte'])` →
 * `"filter[due_at][gte]"`. An empty `path` yields the base key unchanged.
 */
export function buildKey(base: string, path: readonly string[] = []): string {
  return path.reduce((key, segment) => `${key}[${encodeKeySegment(segment)}]`, encodeKeySegment(base));
}

/**
 * Parse a fully-decoded key string into its base segment and bracket path,
 * e.g. `"filter[due_at][gte]"` → `{ base: 'filter', path: ['due_at', 'gte'] }`.
 * Malformed bracket structure degrades gracefully to `{ base: key, path: [] }`.
 */
export function parseKey(decodedKey: string): { base: string; path: string[] } {
  const match = /^([^[\]]+)((?:\[[^[\]]*])*)$/.exec(decodedKey);

  if (!match) {
    return { base: decodedKey, path: [] };
  }

  const [, base = decodedKey, bracketSegment = ''] = match;
  const path = Array.from(bracketSegment.matchAll(/\[([^[\]]*)]/g)).map(segmentMatch => segmentMatch[1] ?? '');

  return { base, path };
}

/** A single raw `key=value` pair extracted from a query string, key already decoded. */
export interface ParsedQueryEntry {
  base: string;
  path: string[];
  /** Still percent-encoded — callers choose `decodeValue` or `decodeList` based on context. */
  rawValue: string;
}

/** Parse a full query string (with or without a leading `?`) into ordered entries. */
export function parseQueryString(search: string): ParsedQueryEntry[] {
  const trimmed = search.startsWith('?') ? search.slice(1) : search;

  if (!trimmed) return [];

  return trimmed
    .split('&')
    .filter(pair => pair !== '')
    .map(pair => {
      const equalsIndex = pair.indexOf('=');
      const rawKey = equalsIndex === -1 ? pair : pair.slice(0, equalsIndex);
      const rawValue = equalsIndex === -1 ? '' : pair.slice(equalsIndex + 1);
      const { base, path } = parseKey(decodeValue(rawKey));

      return { base, path, rawValue };
    });
}
