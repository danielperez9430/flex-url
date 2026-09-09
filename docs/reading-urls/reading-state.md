---
description: Read filters, sorts, includes, fields, appends, pagination, search, and raw params back off a parsed URL.
---

# Reading State Back

Constructing a builder from an existing URL hydrates the exact same state a builder produces —
"parse = build". Every reader method below works on a builder constructed either way.

{% tabs %}
{% tab title="TypeScript" %}
```ts
const parsed = flexUrl(window.location.href);
```
{% endtab %}

{% tab title="PHP" %}
```php
$parsed = FlexUrl::from($request->fullUrl());
```
{% endtab %}
{% endtabs %}

## Filters

{% tabs %}
{% tab title="TypeScript" %}
```ts
parsed.hasFilter('status');          // boolean
parsed.getFilter('status');          // string | string[] | undefined
parsed.getFilter('due_at', 'gte');   // reads a specific operator/scope-arg entry
parsed.getFilters();                 // FilterEntry[] — every filter, in wire order
```
{% endtab %}

{% tab title="PHP" %}
```php
$parsed->hasFilter('status');          // bool
$parsed->getFilter('status');          // string|list<string>|null
$parsed->getFilter('due_at', 'gte');   // reads a specific operator/scope-arg entry
$parsed->getFilters();                 // list<array{attribute, operator, values}>
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
Omitting `operator` on `hasFilter()`/`getFilter()` checks/reads the plain (bracket-less)
`filter[attribute]=` entry specifically — not "any operator".
{% endhint %}

`getFilters()` returns every filter as `{attribute, operator, values}` entries, in wire order — the
plural counterpart to `getFilter()`. It returns entries rather than a keyed object/array because an
attribute can appear more than once under different operators (`filter[due][gte]`,
`filter[due][lte]`), which a map keyed by attribute alone cannot represent.

## Sorts

{% tabs %}
{% tab title="TypeScript" %}
```ts
parsed.getSorts(); // Array<{attribute: string; direction: 'asc' | 'desc'}>
```
{% endtab %}

{% tab title="PHP" %}
```php
$parsed->getSorts(); // list<array{attribute: string, direction: string}>
```
{% endtab %}
{% endtabs %}

## Includes, fields, appends

{% tabs %}
{% tab title="TypeScript" %}
```ts
parsed.getIncludes();      // string[]
parsed.getFields('post');  // string[] | undefined
parsed.getFields();        // Record<string, string[]>
parsed.getAppends('post'); // string[] | undefined
parsed.getAppends();       // Record<string, string[]>
```
{% endtab %}

{% tab title="PHP" %}
```php
$parsed->getIncludes();      // list<string>
$parsed->getFields('post');  // list<string>|null
$parsed->getFields();        // array<string, list<string>>
$parsed->getAppends('post'); // list<string>|null
$parsed->getAppends();       // array<string, list<string>>
```
{% endtab %}
{% endtabs %}

## Pagination

{% tabs %}
{% tab title="TypeScript" %}
```ts
parsed.getPage();       // number | undefined
parsed.getPageSize();   // number | undefined
parsed.getPageCursor(); // string | undefined
```
{% endtab %}

{% tab title="PHP" %}
```php
$parsed->getPage();       // int|null
$parsed->getPageSize();   // int|null
$parsed->getPageCursor(); // string|null
```
{% endtab %}
{% endtabs %}

See [Pagination](../building-urls/pagination.md#reading-pagination-back) for why a non-integer
`page[number]`/`page[size]` returns "absent" instead of a poisoned `0`/`NaN`.

## Search

{% tabs %}
{% tab title="TypeScript" %}
```ts
parsed.getSearch();                // string | undefined
parsed.getSearchFilter('status');  // string | string[] | undefined
```
{% endtab %}

{% tab title="PHP" %}
```php
$parsed->getSearch();                // string|null
$parsed->getSearchFilter('status');  // string|list<string>|null
```
{% endtab %}
{% endtabs %}

## Raw params

`getParam(key)` reads a raw param set with `param()` — the counterpart that made the escape hatch
write-only. Bracket syntax reads a nested one.

{% tabs %}
{% tab title="TypeScript" %}
```ts
parsed.getParam('debug');              // string | string[] | undefined
parsed.getParam('custom_sort[lang]');  // reads one nested entry
```
{% endtab %}

{% tab title="PHP" %}
```php
$parsed->getParam('debug');              // string|list<string>|null
$parsed->getParam('custom_sort[lang]');  // reads one nested entry
```
{% endtab %}
{% endtabs %}

{% hint style="warning" %}
Grammar buckets are not raw params, so `getParam('filter')` is `undefined`/`null` — use
`getFilter()`/`getSorts()`/`getPage()`/etc. for those instead.
{% endhint %}

## Next

* [`toParams()` & `toQuery()`](params-and-query-arrays.md) — the whole state as a nested
  object/array in one call, rather than one reader per bucket.
* [Output Forms](output-forms.md) — rendering the builder back to a string.
