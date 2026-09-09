---
description: Read the whole builder state as a nested object/array with toParams(), or as a parse_str()-shaped array with PHP's toQuery().
---

# toParams() & toQuery()

## `toParams()`

Returns the whole builder state as a plain nested object/array, mirroring the wire's bracket
structure — a single call instead of one reader per bucket.

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts')
  .filter('status', 'published')
  .filter('due_at', 'gte', '2024-01-01')
  .filter('due_at', 'lte', '2024-01-31')
  .sort('-created_at')
  .page(2)
  .toParams();
// {
//   filter: {
//     status: 'published',
//     due_at: {gte: '2024-01-01', lte: '2024-01-31'},
//   },
//   sort: '-created_at',
//   page: {number: '2'},
// }
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts')
    ->filter('status', 'published')
    ->filter('due_at', 'gte', '2024-01-01')
    ->filter('due_at', 'lte', '2024-01-31')
    ->sort('-created_at')
    ->page(2)
    ->toParams();
// [
//   'filter' => [
//     'status' => 'published',
//     'due_at' => ['gte' => '2024-01-01', 'lte' => '2024-01-31'],
//   ],
//   'sort' => '-created_at',
//   'page' => ['number' => '2'],
// ]
```
{% endtab %}
{% endtabs %}

### Shape rules

* `filter[status]=published` → `{filter: {status: 'published'}}`
* `filter[due_at][gte]=X&filter[due_at][lte]=Y` → `{filter: {due_at: {gte: 'X', lte: 'Y'}}}`
* `sort=a,-b` → `{sort: 'a,-b'}`; `include=a,b` → `{include: 'a,b'}`
* `fields[post]=title,body` → `{fields: {post: 'title,body'}}` (same shape for `appends`)
* `page[number]=1&page[size]=25` → `{page: {number: '1', size: '25'}}`
* `q=term` → `{q: 'term'}`; with search filters → `{q: {value: 'term', filter: {...}}}` (no term →
  `{q: {filter: {...}}}`)
* Raw/unknown params are set at their own (possibly nested) path.

{% hint style="info" %}
An attribute with both a plain and an operator-keyed entry is promoted to an object/array with the
plain value moved under the `''` key (e.g. `{status: {'': 'published', equal: 'archived'}}`) —
this only happens if you mix `filter(attr, value)` and `filter(attr, op, value)` for the same
attribute, which is unusual but representable.
{% endhint %}

## `toQuery()` (PHP only)

`toQuery()` returns a flat query array in the shape `Illuminate\Http\Request::query()` (i.e. PHP's
native `parse_str()`) would hold — nested `[]` params become nested arrays, unlike `toParams()`'s
grammar-aware flattening. Useful for building a `Request` to dispatch an in-kernel sub-request,
without a hard dependency on `illuminate/http`:

```php
$flexUrl = FlexUrl::make('/api/v1/projects')->filter('status', 'active')->sort('name')->page(2);

$flexUrl->toQuery();
// ['filter' => ['status' => 'active'], 'sort' => 'name', 'page' => ['number' => '2']]
// — same shape Illuminate\Http\Request::query() would hold (built via parse_str()).

$request = Illuminate\Http\Request::create($flexUrl->toRequestUri(), 'GET');
$response = app(Illuminate\Contracts\Http\Kernel::class)->handle($request);
```

{% hint style="info" %}
`toQuery()` has no TypeScript counterpart: it is `parse_str()` semantics — what Laravel itself will
see — whereas `toParams()` is grammar-aware. Nothing in a browser asks that question, so the
TypeScript package doesn't answer it.
{% endhint %}
