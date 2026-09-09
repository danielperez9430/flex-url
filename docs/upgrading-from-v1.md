---
description: Migrate from the 1.x FlexibleUrl class (TypeScript-only) to the 2.x/3.x FlexUrl builder.
---

# Upgrading from 1.x

{% hint style="info" %}
1.x was a TypeScript-only package (`FlexibleUrl`). The PHP mirror was introduced starting at 2.0.0
as part of this rewrite, so there is nothing to migrate on the PHP side — a PHP project adopting
`open-southeners/flex-url` starts directly on the current API described throughout these docs.
{% endhint %}

v1's `FlexibleUrl` kept only the **origin** of the URL it was constructed from, so
`router.visit(url.toString())` navigated to `/` — the pathname was silently dropped. If you worked
around that with something like:

```ts
router.visit(window.location.pathname + '?' + url.toString().split('?')[1]);
```

replace it with:

```ts
router.visit(url.toRelativeUrl());
```

The workaround above still runs on the current version, but it is now:

* **Redundant** — the pathname is preserved by the builder itself, see
  [Full URL fidelity](README.md#features).
* **Broken in a new way** — it produces `/path?undefined` when no parameters are set.
* **Lossy** — it mangles the hash, which `toRelativeUrl()` preserves.

See [Output Forms](reading-urls/output-forms.md) for the full comparison between `toString()`,
`toRelativeUrl()`, and `toRequestUri()`, and when to reach for each.

## Other 1.x → current differences worth knowing

* The `@flex-url/vue` adapter package has been retired — it is no longer maintained as part of
  this monorepo.
* Every builder method now returns a *new* instance rather than mutating the receiver — see
  [Quick Start](getting-started/quick-start.md).
* Percent-decoding, comma handling, and `+`/space semantics all changed — read
  [Encoding Contract](advanced/encoding-contract.md) if you relied on the previous parsing
  behaviour anywhere.
