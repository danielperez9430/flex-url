---
description: Read links/meta off a JSON:API document and jump straight to the next/previous page as a FlexUrl instance.
---

# JSON:API Links Helper (TypeScript)

{% hint style="info" %}
This is a TypeScript-only feature. There is no PHP equivalent — a backend that generates the
`links`/`meta` object apiable already emits has no need to parse its own response back. If you
need a PHP-side pagination link, build it directly with the core builder API instead.
{% endhint %}

Kept at a separate entry point (`flex-url/links`) so it's tree-shaken out of bundles that only need
the URL builder:

```ts
import {links, meta, nextUrl, prevUrl} from 'flex-url/links';

const response = await fetch('/api/v1/posts', {headers: {Accept: 'application/vnd.api+json'}});
const document = await response.json();

links(document);   // {first, last, prev, next} — each string | null
meta(document);     // {current_page, per_page, total, ...} — apiable's pagination meta
nextUrl(document);  // FlexUrl | null — parsed straight from links.next
prevUrl(document);  // FlexUrl | null — parsed straight from links.prev

nextUrl(document)?.getPageCursor(); // works for cursor pagination too
```

## Pagination strategy compatibility

Works with all three of apiable's pagination strategies — every field is simply `null`/absent when
apiable didn't emit it for the active strategy:

| Strategy | `links` | `meta` |
|---|---|---|
| Length-aware | Full `first`/`last`/`prev`/`next` | Full (`total`, `last_page`, `current_page`, ...) |
| Simple | No `last` | No `total`/`last_page` |
| Cursor | No `first`/`last` | No `current_page`/`total` |

## Scope

No resource deserialisation happens here — `data`/`included` pass through the `document` object
untouched. Pair this helper with a JSON:API client such as [jsona](https://github.com/olosegres/jsona)
for parsing `data`/`included` into your own resource types.

## Types

```ts
import type {JsonApiDocument, JsonApiLinks, JsonApiMeta, JsonApiPaginationLinks} from 'flex-url/links';
```

`JsonApiDocument` is the minimal shape this helper reads from (`links`, `meta`, and pass-through
`data`/`included`) — you can widen it with your own resource types via an intersection or generic
wrapper without losing compatibility with these helpers.
