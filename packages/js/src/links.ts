/**
 * JSON:API `links`/`meta` helpers — deliberately kept out of the main entry
 * point (`import ... from 'flex-url/links'`) so consumers
 * that only need the URL builder don't pull this in. No resource
 * deserialisation here — that's out of scope for v2 (see the design plan).
 */
import {flexUrl, FlexUrl} from './flex-url.js';

/** The four pagination links every apiable pagination strategy may emit (each nullable). */
export interface JsonApiLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
  self?: string | null;
  [key: string]: string | null | undefined;
}

/**
 * Pagination `meta`. Every field is optional because apiable omits fields
 * that don't apply to the active pagination strategy — e.g. `simplePaginating()`
 * has no `total`/`last_page`, `cursorPaginating()` has neither of those nor
 * `current_page`. See laravel-apiable's `docs/responses/pagination.md`.
 */
export interface JsonApiMeta {
  current_page?: number;
  from?: number | null;
  last_page?: number;
  path?: string;
  per_page?: number;
  to?: number | null;
  total?: number;
  [key: string]: unknown;
}

/** The minimal shape of a JSON:API document this helper reads from — `data`/`included` pass through untouched. */
export interface JsonApiDocument {
  links?: JsonApiLinks;
  meta?: JsonApiMeta;
  data?: unknown;
  included?: unknown[];
  [key: string]: unknown;
}

/** The four navigation links, normalised to `null` when absent (rather than `undefined`). */
export interface JsonApiPaginationLinks {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
}

/**
 * Reads the navigation links off a JSON:API document. Works with
 * length-aware (`first`/`last`/`prev`/`next`), simple (no `last`), and
 * cursor (no `first`/`last`) pagination shapes — every field is simply
 * `null` when apiable didn't emit it.
 */
export function links(document: JsonApiDocument): JsonApiPaginationLinks {
  return {
    first: document.links?.first ?? null,
    last: document.links?.last ?? null,
    prev: document.links?.prev ?? null,
    next: document.links?.next ?? null,
  };
}

/** Reads the pagination `meta` object off a JSON:API document (`{}` when absent). */
export function meta(document: JsonApiDocument): JsonApiMeta {
  return document.meta ?? {};
}

/** Parses `links.next` into a `FlexUrl` instance, or `null` when there is no next page. */
export function nextUrl(document: JsonApiDocument): FlexUrl | null {
  const href = document.links?.next;

  return href ? flexUrl(href) : null;
}

/** Parses `links.prev` into a `FlexUrl` instance, or `null` when there is no previous page. */
export function prevUrl(document: JsonApiDocument): FlexUrl | null {
  const href = document.links?.prev;

  return href ? flexUrl(href) : null;
}
