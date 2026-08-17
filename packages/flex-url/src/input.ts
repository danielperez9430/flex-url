/** The parts of an input URL/path that a `FlexUrl` instance needs to round-trip. */
export interface UrlParts {
  origin: string;
  pathname: string;
  search: string;
  hash: string;
}

const EMPTY_PARTS: UrlParts = {origin: '', pathname: '', search: '', hash: ''};

/**
 * Parse a starting URL/path into its origin/pathname/search/hash parts.
 *
 * Unlike v1 (which kept only `origin` and silently dropped the pathname),
 * every part is preserved so it can be round-tripped through `toString()`.
 * Accepts a `URL` instance, an absolute URL string, a relative path
 * (`/posts`, `posts?foo=bar`, `#hash`), or nothing at all (a "bare" builder
 * that renders just the query string).
 */
export function parseInput(input?: string | URL): UrlParts {
  if (input instanceof URL) {
    return {
      origin: input.origin === 'null' ? '' : input.origin,
      pathname: input.pathname,
      search: input.search,
      hash: input.hash,
    };
  }

  if (input === undefined || input === '') {
    return {...EMPTY_PARTS};
  }

  try {
    const parsed = new URL(input);

    return {origin: parsed.origin, pathname: parsed.pathname, search: parsed.search, hash: parsed.hash};
  } catch {
    // Relative input has no scheme/host for the URL constructor to anchor on — split it by hand.
    const hashIndex = input.indexOf('#');
    const hash = hashIndex === -1 ? '' : input.slice(hashIndex);
    const withoutHash = hashIndex === -1 ? input : input.slice(0, hashIndex);
    const queryIndex = withoutHash.indexOf('?');
    const pathname = queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
    const search = queryIndex === -1 ? '' : withoutHash.slice(queryIndex);

    return {origin: '', pathname, search, hash};
  }
}
