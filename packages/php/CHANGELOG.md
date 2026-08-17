# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New `open-southeners/flex-url` package: an immutable, fluent `FlexUrl`
  builder/parser for the apiable request-query grammar — the PHP mirror of
  `@open-southeners/flex-url`, with identical method names and wire semantics.
  `FlexUrl::make()`/`FlexUrl::from()` and the global `flex_url()` helper cover
  `filter()` (with `eq`/`equal`/`like`/`gt`/`gte`/`lt`/`lte` operators,
  comma-joined multi-values, and range filters via two calls or the
  `between()` shorthand), `filterScope()` (truthy toggles, named scope
  arguments, and the `_scoped` suffix), `sort()`/`sortDesc()` (accumulating,
  dot-path relationship sorts), `include()`, `fields()`, `append()` (wire key
  `appends[type]`), `page()`/`pageSize()`/`pageCursor()`,
  `search()`/`searchFilter()`, and a raw `param()` escape hatch. Every call
  returns a new instance — nothing is ever mutated in place.
- **Full URL fidelity**: constructing from a URL preserves its pathname,
  port, hash, and any existing query params. Parsing and building share the
  same internal state, so `FlexUrl::make($url)->toString()` round-trips
  losslessly, and readers (`hasFilter()`, `getFilter()`, `getSorts()`,
  `getIncludes()`, `getPage()`, `getPageSize()`, `getPageCursor()`,
  `getFields()`, `getAppends()`, `getSearch()`, `getSearchFilter()`,
  `toParams()`) expose the exact same vocabulary for hydrating UI state from
  the address bar — matching the TypeScript core.
- **Encoding contract**: brackets and commas are emitted raw (matching
  apiable's own idiom); every value is percent-encoded individually before
  being comma-joined, so a literal comma/bracket/space/`%`/`=`/`&` inside a
  value can never be confused with the grammar's structural characters.
  Parsing accepts both raw and percent-encoded brackets/commas on input
  (apiable's own pagination links use `page%5Bnumber%5D`).
- **Server-driven table support**: `toQuery()` returns the query state as a
  flat, nested array shaped exactly like `Illuminate\Http\Request::query()`
  would hold it, and `toRequestUri()` returns the `pathname?query` string —
  together they're enough to dispatch an in-kernel sub-request against an
  apiable endpoint (e.g. from a Livewire component) without this package
  depending on illuminate/http.
- `FlexUrl::from()` accepts a plain string or anything `Stringable`
  (including PSR-7's `UriInterface`, which qualifies without adding
  `psr/http-message` as a dependency) — the package has zero runtime
  dependencies.
- Shared JSON fixtures (`fixtures/cases.json`) covering every grammar
  feature, encoding edge case, and v1 regression — replayed by both this
  package's PHPUnit suite and the TypeScript core's Vitest suite so the two
  implementations can't silently drift apart.
