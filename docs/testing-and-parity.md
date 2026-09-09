---
description: How the TypeScript and PHP mirrors are tested against the same JSON fixtures so they can't silently drift apart.
---

# Test Parity Between Mirrors

Method names and wire semantics are kept **identical** between `flex-url` (TypeScript) and
`open-southeners/flex-url` (PHP) on purpose. That guarantee is enforced mechanically, not just by
convention: both packages run their own test suite (Vitest for TypeScript, PHPUnit for PHP)
against the same language-neutral fixture file — `fixtures/cases.json` — rather than each package
maintaining its own separate set of "does this match apiable's grammar" assertions.

## How a fixture case works

Each entry in `fixtures/cases.json` is a case object describing:

* `base` — the starting URL the builder is constructed from.
* `options` — optional construction options (currently just `strictCommaEncoding`), applied to
  both the build and, when relevant, the read-back parse.
* `build` — an ordered list of method calls (`op`/`args`) applied to the builder, one call per
  descriptor.
* `url` — the exact string both packages' `toString()` must produce after applying every `build`
  step to `base`.
* `reads` (optional) — reader assertions: constructing a **fresh** builder instance from the
  canonical URL (parse = build) must satisfy every `op`/`args`/`equals` assertion listed.
* `readsFrom` (optional, defaults to `"url"`) — for parse-only cases (`build: []`), whether the
  reader is constructed from `base` or from `url`. Set to `"base"` when the point of the case is
  what a URL nobody would ever *emit* (a malformed escape, a raw `+`, an explicit `[]`) parses to.

```jsonc
{
  "name": "filter with multiple values comma-joins raw",
  "base": "https://api.example.com/posts",
  "build": [
    {"op": "filter", "args": ["status", ["published", "draft"]]},
    {"op": "sort", "args": ["-created_at"]}
  ],
  "url": "https://api.example.com/posts?filter[status]=published,draft&sort=-created_at",
  "reads": [
    {"op": "getFilter", "args": ["status"], "equals": ["published", "draft"]},
    {"op": "getSorts", "args": [], "equals": [{"attribute": "created_at", "direction": "desc"}]}
  ]
}
```

Every `op`/`args`/`equals` value must be representable in plain JSON (strings, numbers, booleans,
arrays, objects, `null`) — no language-specific types. Each language's test runner maps `op` names
to its own method calls.

## What a fixture case can and can't cover

* `reads` may target any zero-argument output method the two packages **share** (`toString`,
  `toRequestUri`, `toRelativeUrl`, `toParams`) as well as the typed getters.
* A method that exists in only **one** package — PHP's `toQuery()`, which is `parse_str()`
  semantics with no browser-side counterpart — never appears in a fixture case; it's covered in
  that package's own suite instead. Needing a per-language `equals` for the same case would be a
  signal that the mirrored API has drifted, not a reason to add one.
* `PHP` returns `null` and TypeScript returns `undefined` for the same "absent" state — the
  TypeScript runner normalises `undefined` to `null` before comparing, so a fixture can't
  distinguish the two and shouldn't try to.
* Descriptors stay minimal: one call per array entry, no nesting/branching. A case that needs
  conditional logic belongs as multiple cases instead.

The full field-by-field schema lives in
[`fixtures/SCHEMA.md`](https://github.com/open-southeners/flex-url/blob/main/fixtures/SCHEMA.md)
in the repository.

## Running the suites

{% tabs %}
{% tab title="TypeScript" %}
```bash
npm run test --workspace packages/js
```
{% endtab %}

{% tab title="PHP" %}
```bash
cd packages/php
vendor/bin/phpunit
```
{% endtab %}
{% endtabs %}

Both suites load and run every case in `fixtures/cases.json` in addition to their own
language-specific unit tests. Adding a case to `cases.json` automatically covers both languages —
there's no need to hand-write the same assertion twice.
