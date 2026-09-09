---
description: Build sort= query parameters, ascending and descending.
---

# Sorting

`sort(attribute)` sorts ascending; prefixing the attribute with `-` sorts descending.
`sortDesc(attribute)` is sugar for the same. Repeated calls accumulate into a comma-joined list.

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts').sort('title');
// /posts?sort=title

flexUrl('/posts').sort('-created_at');
// /posts?sort=-created_at

flexUrl('/posts').sort('priority').sortDesc('created_at');
// /posts?sort=priority,-created_at
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts')->sort('title');
// /posts?sort=title

FlexUrl::make('/posts')->sort('-created_at');
// /posts?sort=-created_at

FlexUrl::make('/posts')->sort('priority')->sortDesc('created_at');
// /posts?sort=priority,-created_at
```
{% endtab %}
{% endtabs %}

## Reading sorts back

```
GET /posts?sort=priority,-created_at
```

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts?sort=priority,-created_at').getSorts();
// [
//   {attribute: 'priority', direction: 'asc'},
//   {attribute: 'created_at', direction: 'desc'},
// ]
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts?sort=priority,-created_at')->getSorts();
// [
//   ['attribute' => 'priority', 'direction' => 'asc'],
//   ['attribute' => 'created_at', 'direction' => 'desc'],
// ]
```
{% endtab %}
{% endtabs %}

## Removing sorts

Use `removeParam('sort')` to clear the whole `sort` bucket — see
[Raw Params & Clearing](raw-params-and-clearing.md). There is no per-attribute `removeSort()`;
build the desired sort list from scratch with `sort()`/`sortDesc()` calls, or clear and re-add.
