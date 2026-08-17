/**
 * Covers the three pagination shapes laravel-apiable actually emits (see
 * `laravel-apiable/tests/JsonApiPaginationTest.php` and
 * `docs/responses/pagination.md`, read-only references for this package):
 * length-aware (full `links`/`meta`), simple (no `last`/`total`), and
 * cursor (no `first`/`last`/`current_page`/`total`).
 */
import {describe, expect, it} from 'vitest';

import {links, meta, nextUrl, prevUrl, type JsonApiDocument} from '../src/links.js';

describe('links()/meta()', () => {
  it('reads a length-aware pagination document (first/last/prev/next all present)', () => {
    const document: JsonApiDocument = {
      data: [],
      links: {
        first: 'http://localhost:8000/api/films?page%5Bnumber%5D=1',
        last: 'http://localhost:8000/api/films?page%5Bnumber%5D=4',
        prev: null,
        next: 'http://localhost:8000/api/films?page%5Bnumber%5D=2',
      },
      meta: {
        current_page: 1,
        from: 1,
        last_page: 4,
        path: 'http://localhost:8000/api/films',
        per_page: 50,
        to: 50,
        total: 183,
      },
    };

    expect(links(document)).toEqual({
      first: 'http://localhost:8000/api/films?page%5Bnumber%5D=1',
      last: 'http://localhost:8000/api/films?page%5Bnumber%5D=4',
      prev: null,
      next: 'http://localhost:8000/api/films?page%5Bnumber%5D=2',
    });
    expect(meta(document).total).toBe(183);
    expect(meta(document).last_page).toBe(4);
  });

  it('reads a simple pagination document (no last/total, links.last is null)', () => {
    const document: JsonApiDocument = {
      links: {
        first: null,
        last: null,
        prev: null,
        next: 'http://localhost:8000/posts-response?page%5Bnumber%5D=2',
      },
      meta: {per_page: 2},
    };

    expect(links(document).last).toBeNull();
    expect(meta(document).total).toBeUndefined();
    expect(meta(document).per_page).toBe(2);
  });

  it('reads a cursor pagination document (no first/last/current_page/total)', () => {
    const document: JsonApiDocument = {
      links: {
        first: null,
        last: null,
        prev: null,
        next: 'http://localhost:8000/posts-response?page%5Bcursor%5D=eyJpZCI6Mn0',
      },
      meta: {per_page: 2},
    };

    const result = links(document);

    expect(result.first).toBeNull();
    expect(result.last).toBeNull();
    expect(result.next).toContain('page%5Bcursor%5D=');
    expect(meta(document).current_page).toBeUndefined();
  });

  it('defaults to empty links/meta when the document has neither', () => {
    expect(links({})).toEqual({first: null, last: null, prev: null, next: null});
    expect(meta({})).toEqual({});
  });
});

describe('nextUrl()/prevUrl()', () => {
  it('parses links.next into a FlexUrl instance, reading its cursor back out', () => {
    const document: JsonApiDocument = {
      links: {next: 'http://localhost:8000/posts-response?page%5Bcursor%5D=eyJpZCI6Mn0', prev: null},
    };

    const next = nextUrl(document);

    expect(next).not.toBeNull();
    expect(next?.getPageCursor()).toBe('eyJpZCI6Mn0');
    expect(next?.toString()).toBe('http://localhost:8000/posts-response?page[cursor]=eyJpZCI6Mn0');
  });

  it('returns null when there is no next/prev page', () => {
    const document: JsonApiDocument = {links: {next: null, prev: null}};

    expect(nextUrl(document)).toBeNull();
    expect(prevUrl(document)).toBeNull();
  });

  it('parses links.prev the same way', () => {
    const document: JsonApiDocument = {
      links: {prev: 'http://localhost:8000/posts?page%5Bnumber%5D=1', next: null},
    };

    expect(prevUrl(document)?.getPage()).toBe(1);
  });
});
