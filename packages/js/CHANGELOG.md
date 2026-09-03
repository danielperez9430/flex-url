# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- `removeParam()` now reaches nested raw params: `removeParam('custom_sort[lang]')`
  removes that one entry, and the bare `removeParam('custom_sort')` removes every
  `custom_sort[...]` under it. Previously both were silent no-ops, leaving a
  parsed nested raw param with no way to remove it at all.

## [2.0.0] - 2026-09-03

### Added

- **`toRelativeUrl()` and `toRequestUri()`** — the origin-relative output
  forms. `toRelativeUrl()` returns `pathname?query#hash`, which is what
  Inertia's `router.visit()`, `history.pushState()` and vue-router expect;
  `history.pushState()` throws a `SecurityError` when the origin differs from
  the document's, so `toString()` is the wrong tool as soon as you build from
  an API URL. `toRequestUri()` is the same string without the fragment — the
  part that reaches the server — and mirrors the PHP package's method of the
  same name. `toString()` is unchanged and remains the round-trip form. See
  README › Navigating with the result, and › Upgrading from 1.x for replacing
  the `window.location.pathname + '?' + ...split('?')[1]` workaround v1's
  pathname drop forced on callers.
- **Immutable fluent builder** for the apiable request-query grammar —
  `flexUrl()`/`url()` — covering `filter()` (with `eq`/`equal`/`like`/`gt`/
  `gte`/`lt`/`lte` operators, comma-joined multi-values, and range filters via
  two calls or the `between()` shorthand), `filterScope()` (truthy toggles,
  named scope arguments, and the `_scoped` suffix), `sort()`/`sortDesc()`
  (accumulating, dot-path relationship sorts), `include()`, `fields()`,
  `append()` (wire key `appends[type]`), `page()`/`pageSize()`/`pageCursor()`,
  `search()`/`searchFilter()`, and a raw `param()` escape hatch. Every call
  returns a new instance — nothing is ever mutated in place.
- **Full URL fidelity**: constructing from a URL preserves its pathname,
  port, hash, and any existing query params, fixing v1's silent pathname
  drop. Parsing and building share the same internal state, so `flexUrl(url)`
  followed by `toString()` round-trips losslessly, and readers
  (`hasFilter()`, `getFilter()`, `getSorts()`, `getIncludes()`, `getPage()`,
  `getPageSize()`, `getPageCursor()`, `getFields()`, `getAppends()`,
  `getSearch()`, `getSearchFilter()`, `toParams()`) expose the exact same
  vocabulary for hydrating UI state from the address bar.
- **Encoding contract**: brackets and commas are emitted raw (matching
  apiable's own idiom); every value is percent-encoded individually before
  being comma-joined, so a literal comma/bracket/space/`%`/`=`/`&` inside a
  value can never be confused with the grammar's structural characters.
  Parsing accepts both raw and percent-encoded brackets/commas on input
  (apiable's own pagination links use `page%5Bnumber%5D`).
- **Typed endpoint schemas**: `flexUrl<S extends EndpointSchema>(path, schema?)`
  narrows `filter()`/`sort()`/`include()`/`fields()`/`append()` to a
  generated endpoint's allowed vocabulary at compile time; untyped usage
  (`flexUrl(path)`) is unaffected. When a schema object is supplied at
  runtime, unrecognised filters/sorts/includes/fields/appends log a
  `console.warn` (never throws, never changes behaviour).
- **`flex-url/links` subpath**: `links(doc)`, `meta(doc)`,
  `nextUrl(doc)`, `prevUrl(doc)` read JSON:API pagination `links`/`meta` off
  a response document — works with apiable's length-aware, simple, and
  cursor pagination shapes. Kept as a separate entry point so it's
  tree-shaken out when unused.
- Shared JSON fixtures (`fixtures/cases.json`) covering every grammar
  feature, encoding edge case, and v1 regression — replayed by both this
  package's Vitest suite and the PHP mirror's PHPUnit suite so the two
  implementations can't silently drift apart.

### Changed

- **A raw `+` in a query string now parses as a space** (`%2B` remains a
  literal plus), matching `URLSearchParams`, HTML GET forms, PHP's `$_GET`
  and Laravel's `Request::query()`. Previously `?q=hello+world` parsed to
  `"hello+world"` and re-serialised to `?q=hello%2Bworld`, silently changing
  the value the server saw. Serialising still never emits `+`, so a parsed
  URL round-trips to the same meaning server-side.
- **v2 reset**: the package is being rebuilt from scratch as a scoped
  `flex-url` package targeting the apiable request grammar
  (filters, sorts, includes, fields, appends, pagination, search), with an
  immutable builder API and a mirrored PHP package. The 1.x line is preserved
  in git history for reference.
- Tooling moved to npm workspaces, `tsup` (ESM + CJS + type declarations) and
  Vitest.

### Removed

- The `@flex-url/vue` adapter package has been retired (no longer maintained
  as part of this monorepo).

### Fixed

- **Percent-decoding is now total, UTF-8-safe and identical to the PHP
  mirror.** `decodeURIComponent` is all-or-nothing: a single malformed escape
  threw, discarding the rest of an otherwise fine value, and its failure mode
  didn't line up with PHP's byte-oriented `rawurldecode` — the two
  implementations returned different values for the same URL on every
  malformed or non-UTF-8 input. Decoding now walks the escapes itself: a `%`
  not followed by two hex digits is a literal `%` (`20%`, `50%off`, `%zz`
  survive intact), and bytes that don't form valid UTF-8 become U+FFFD.
- **`getPage()`/`getPageSize()` return `undefined` for non-integer page
  params.** `?page[number]=abc` used to produce `NaN`, which flowed straight
  into arithmetic.
- **A single-value `q[filter][attr][]` keeps its `[]` marker.** It used to
  round-trip to `q[filter][attr]=`, downgrading apiable's `whereIn()` to a
  scalar `where()`. `getSearchFilter()` and `toParams()` likewise report it
  as a one-element list rather than a string.
