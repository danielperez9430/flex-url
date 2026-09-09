---
description: Build page[number], page[size], and page[cursor] query parameters.
---

# Pagination

`page()`, `pageSize()`, and `pageCursor()` set the three sub-keys apiable's pagination strategies
read from the `page` bucket. Use whichever apply to the active strategy — length-aware and simple
pagination use `number`/`size`; cursor pagination uses `cursor` (and optionally `size`).

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts').page(2).pageSize(25);
// /posts?page[number]=2&page[size]=25

flexUrl('/posts').pageCursor('eyJpZCI6MTB9');
// /posts?page[cursor]=eyJpZCI6MTB9
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts')->page(2)->pageSize(25);
// /posts?page[number]=2&page[size]=25

FlexUrl::make('/posts')->pageCursor('eyJpZCI6MTB9');
// /posts?page[cursor]=eyJpZCI6MTB9
```
{% endtab %}
{% endtabs %}

## Reading pagination back

`getPage()`/`getPageSize()` only return a value when the URL actually carried an integer — a URL
is user-supplied, so `page[number]=abc` is entirely possible. A non-integer (or absent) value
returns `undefined`/`null` rather than `NaN` or a silently-wrong `0`, so it can't poison arithmetic
downstream.

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts?page[number]=2&page[size]=25').getPage();     // 2
flexUrl('/posts?page[number]=2&page[size]=25').getPageSize(); // 25
flexUrl('/posts?page[number]=abc').getPage();                 // undefined
flexUrl('/posts?page[cursor]=eyJpZCI6MTB9').getPageCursor();  // "eyJpZCI6MTB9"
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts?page[number]=2&page[size]=25')->getPage();     // 2
FlexUrl::make('/posts?page[number]=2&page[size]=25')->getPageSize(); // 25
FlexUrl::make('/posts?page[number]=abc')->getPage();                 // null
FlexUrl::make('/posts?page[cursor]=eyJpZCI6MTB9')->getPageCursor();  // "eyJpZCI6MTB9"
```
{% endtab %}
{% endtabs %}

## Consuming a paginated response

Advancing to a `links.next` page from an apiable JSON:API response is covered under
[JSON:API Links Helper](../advanced/json-api-links.md) (TypeScript-only — see that page for the
`nextUrl()`/`prevUrl()` helpers, which return a ready-made `FlexUrl` including cursor-based
pagination).
