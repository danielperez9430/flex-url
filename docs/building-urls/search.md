---
description: Build q= full-text search and q[filter][]= search-scoped filter query parameters.
---

# Search

`search(term)` sets the top-level `q=term`, apiable's full-text search parameter (Laravel Scout
integration). `searchFilter(attribute, values)` narrows a search within `q[filter][attribute]=`.

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts').search('laravel');
// /posts?q=laravel

flexUrl('/posts').search('laravel').searchFilter('status', 'published');
// /posts?q=laravel&q[filter][status]=published
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts')->search('laravel');
// /posts?q=laravel

FlexUrl::make('/posts')->search('laravel')->searchFilter('status', 'published');
// /posts?q=laravel&q[filter][status]=published
```
{% endtab %}
{% endtabs %}

## `whereIn()` semantics for multiple values

A single value uses the plain key. **Multiple** values use apiable's repeated-`[]` `whereIn()`
convention rather than the comma list used elsewhere in the grammar — this differs from
`filter()`/`sort()`/`include()` deliberately, because apiable's own search-filter parsing expects
it:

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts').search('laravel').searchFilter('status', ['published', 'draft']).toString();
// /posts?q=laravel&q[filter][status][]=published&q[filter][status][]=draft
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts')->search('laravel')->searchFilter('status', ['published', 'draft'])->toString();
// /posts?q=laravel&q[filter][status][]=published&q[filter][status][]=draft
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
An explicit `[]` on the wire stays a list even with a single value: parsing
`q[filter][status][]=published` back reports `["published"]`, not `"published"` — the `[]`
suffix itself is the signal, not the value count.
{% endhint %}

## Reading search back

{% tabs %}
{% tab title="TypeScript" %}
```ts
const parsed = flexUrl('/posts?q=laravel&q[filter][status]=published');

parsed.getSearch();               // "laravel"
parsed.getSearchFilter('status'); // "published"
```
{% endtab %}

{% tab title="PHP" %}
```php
$parsed = FlexUrl::from('/posts?q=laravel&q[filter][status]=published');

$parsed->getSearch();               // "laravel"
$parsed->getSearchFilter('status'); // "published"
```
{% endtab %}
{% endtabs %}

Because `q` is a scalar param, a comma inside a search term stays literal — it is not split into
several values the way `filter`/`sort`/`include`/`fields`/`appends` are. See
[Encoding Contract](../advanced/encoding-contract.md).
