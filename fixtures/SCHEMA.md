# Shared fixture schema

`cases.json` is a language-neutral table of canonical build/read cases, shared
by the Vitest suite (`packages/flex-url`) and the PHPUnit suite
(`packages/php`) so the two implementations can't drift silently. This file
documents the intended shape; `cases.json` itself starts empty — A2/A3 (the
core implementations) populate it once the builder API is frozen.

Each entry in the top-level array is a case object:

```jsonc
{
  // Short, unique, human-readable identifier for the case (used as the test
  // name/description on both sides).
  "name": "filter with multiple values comma-joins raw",

  // The base URL the builder starts from, e.g. via `flexUrl(base)` /
  // `FlexUrl::from($base)`. Pathname, port, and any existing query string on
  // this URL must be preserved through the build.
  "base": "https://api.example.com/posts",

  // Ordered list of operation descriptors applied to the builder, one call
  // per descriptor, applied in array order. `op` is the method name shared
  // by both implementations (camelCase, matching the mirrored API); `args`
  // is the ordered list of arguments passed to that call.
  "build": [
    { "op": "filter", "args": ["status", ["published", "draft"]] },
    { "op": "sort", "args": ["-created_at"] }
  ],

  // The exact string both `toString()` (TS) and `__toString()`/`->toUrl()`
  // (PHP) must produce after applying every `build` step, in order, to
  // `base`.
  "url": "https://api.example.com/posts?filter[status]=published,draft&sort=-created_at",

  // Optional: read-back assertions. Constructing a fresh builder instance
  // from `url` (parse = build) must satisfy every assertion here. Each
  // assertion is a reader call (`op`/`args`, same shape as `build`) paired
  // with the value it must return/equal on both sides.
  "reads": [
    { "op": "getFilter", "args": ["status"], "equals": ["published", "draft"] },
    { "op": "getSort", "args": [], "equals": [{ "attribute": "created_at", "direction": "desc" }] }
  ]
}
```

Notes:

- `op`/`args`/`equals` values must be representable in plain JSON (strings,
  numbers, booleans, arrays, objects, null) — no language-specific types.
  Each runner maps `op` names to its own method calls.
- `reads` is optional; omit it for cases that only assert the built URL.
- Keep descriptors minimal: one call per array entry, no nesting/branching.
  A case that needs conditional logic belongs as multiple cases instead.
