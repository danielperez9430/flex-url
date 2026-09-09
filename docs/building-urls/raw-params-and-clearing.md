---
description: Set arbitrary query params outside the typed grammar, and remove or clear buckets and params.
---

# Raw Params & Clearing

## Raw escape hatch: `param()`

`param(key, value)` sets an arbitrary top-level param outside the typed grammar
(`filter`/`sort`/`include`/`fields`/`appends`/`page`/`q`). Passing an array of values sends
**repeated keys** — not the `[]` suffix `searchFilter()` uses.

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts').param('debug', '1');
// /posts?debug=1

flexUrl('/posts').param('tag', ['a', 'b']);
// /posts?tag=a&tag=b
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts')->param('debug', '1');
// /posts?debug=1

FlexUrl::make('/posts')->param('tag', ['a', 'b']);
// /posts?tag=a&tag=b
```
{% endtab %}
{% endtabs %}

Read a raw param back with `getParam(key)` — see
[Reading State Back](../reading-urls/reading-state.md#raw-params).

## Removing a param or clearing a bucket

`removeParam(key)` does one of two things, depending on `key`:

* When `key` is one of `filter`, `sort`, `include`, `fields`, `appends`, `page`, or `q`, it clears
  the **entire bucket**.
* Otherwise, it removes a raw param set via `param()`.

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts').sort('title').removeParam('sort');        // clears the whole sort bucket
flexUrl('/posts').param('debug', '1').removeParam('debug'); // drops a raw param
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts')->sort('title')->removeParam('sort');        // clears the whole sort bucket
FlexUrl::make('/posts')->param('debug', '1')->removeParam('debug'); // drops a raw param
```
{% endtab %}
{% endtabs %}

## Nested raw params

`removeParam()` also reaches nested raw params — the custom, outside-the-grammar keys a URL may
carry. A bracketed key targets one entry; a **bare** key removes everything under it, the same
rule the bucket names follow:

{% tabs %}
{% tab title="TypeScript" %}
```ts
const u = flexUrl('/posts?custom_sort[lang]=asc&custom_sort[dir]=desc');

u.removeParam('custom_sort[lang]'); // "/posts?custom_sort[dir]=desc"
u.removeParam('custom_sort');       // "/posts"
```
{% endtab %}

{% tab title="PHP" %}
```php
$u = FlexUrl::make('/posts?custom_sort[lang]=asc&custom_sort[dir]=desc');

$u->removeParam('custom_sort[lang]'); // "/posts?custom_sort[dir]=desc"
$u->removeParam('custom_sort');       // "/posts"
```
{% endtab %}
{% endtabs %}

## Clearing everything

`clear()` drops every param — filters, sorts, includes, fields, appends, page, search, and raw —
while keeping origin/pathname/hash intact:

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts').filter('status', 'published').sort('title').clear();
// /posts
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts')->filter('status', 'published')->sort('title')->clear();
// /posts
```
{% endtab %}
{% endtabs %}

For per-attribute removal within a bucket, see the bucket's own page — e.g.
[`removeFilter()`](filters.md#removing-filters) for a single filter, or
[`removeFilterValue()`](filters.md#multi-value-filters) for one value in a multi-value filter.
