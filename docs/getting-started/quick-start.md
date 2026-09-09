---
description: A tour of the flex-url builder and reader API.
---

# Quick Start

## Why flex-url

* **Immutable** — every builder call returns a *new* instance. Nothing is ever mutated in place,
  so instances are safe to pass around, store, or reuse as a starting point for several requests.
* **Parse = build** — constructing from a URL hydrates the exact same state a builder produces —
  round-trip a URL and read it back with `getFilter()`, `getSorts()`, `getPage()`, etc. This is the
  vocabulary a data table (or a server-driven Livewire table) uses to restore its filters from the
  address bar or an incoming request.
* **Full URL fidelity** — pathname, port, hash, and any existing query params are preserved.
* **Matches apiable's own encoding idiom** — brackets and commas are raw on the wire; individual
  values are percent-encoded. See [Encoding Contract](../advanced/encoding-contract.md).

## Building a URL

{% tabs %}
{% tab title="TypeScript" %}
```ts
import {flexUrl} from 'flex-url';
// `url` is an alias for `flexUrl`.

const built = flexUrl('/posts')
  .filter('status', ['published', 'draft'])       // filter[status]=published,draft
  .filter('title', 'like', 'laravel')              // filter[title][like]=laravel
  .between('due_at', '2024-01-01', '2024-01-31')   // filter[due_at][gte]=...&filter[due_at][lte]=...
  .filterScope('overdue')                          // filter[overdue]=1
  .filterScope('reviewedBy', {user: 42})           // filter[reviewedBy][user]=42
  .sort('priority').sortDesc('created_at')         // sort=priority,-created_at
  .include('project', 'assignee.team')             // include=project,assignee.team
  .fields('post', 'title', 'body')                 // fields[post]=title,body
  .append('post', 'is_overdue')                    // appends[post]=is_overdue
  .page(2).pageSize(25)                            // page[number]=2&page[size]=25
  .search('laravel').searchFilter('status', 'published') // q=laravel&q[filter][status]=published
  .param('debug', '1');                            // debug=1 (raw escape hatch)

built.toString();
```
{% endtab %}

{% tab title="PHP" %}
```php
use OpenSoutheners\FlexUrl\FlexUrl;
// `flex_url()` is a global helper alias for `FlexUrl::make()`.

$built = FlexUrl::make('/posts')
    ->filter('status', ['published', 'draft'])       // filter[status]=published,draft
    ->filter('title', 'like', 'laravel')              // filter[title][like]=laravel
    ->between('due_at', '2024-01-01', '2024-01-31')   // filter[due_at][gte]=...&filter[due_at][lte]=...
    ->filterScope('overdue')                          // filter[overdue]=1
    ->filterScope('reviewedBy', ['user' => 42])       // filter[reviewedBy][user]=42
    ->sort('priority')->sortDesc('created_at')        // sort=priority,-created_at
    ->include('project', 'assignee.team')             // include=project,assignee.team
    ->fields('post', 'title', 'body')                 // fields[post]=title,body
    ->append('post', 'is_overdue')                    // appends[post]=is_overdue
    ->page(2)->pageSize(25)                           // page[number]=2&page[size]=25
    ->search('laravel')->searchFilter('status', 'published') // q=laravel&q[filter][status]=published
    ->param('debug', '1');                            // debug=1 (raw escape hatch)

$built->toString();
```
{% endtab %}
{% endtabs %}

Every call above is documented in detail under [Building URLs](../building-urls/filters.md).

## Constructing a builder

Both packages accept the same range of inputs:

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl();                                          // bare builder, renders just a query string
flexUrl('/posts');                                   // hydrates from a relative path
flexUrl('https://api.example.com/posts?foo=bar');    // hydrates from a full URL
flexUrl(new URL('https://api.example.com/posts'));    // also accepts a `URL` instance
flexUrl('/api/v1/issues', issuesSchema);              // schema-narrowed, see Typed Schemas
flexUrl('/posts', undefined, {strictCommaEncoding: true}); // construction options
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make();                                     // bare builder, renders just a query string
FlexUrl::make('/posts');                              // hydrates from a relative path
FlexUrl::make('https://api.example.com/posts?foo=bar'); // hydrates from a full URL
FlexUrl::from($psrUri);                                // any PSR-7 Stringable UriInterface
FlexUrl::make('/posts', new FlexUrlOptions(strictCommaEncoding: true)); // construction options
```

{% hint style="warning" %}
The `flex_url()` global helper is a plain alias for `FlexUrl::make($url)` and only forwards the
`$url` argument — it has no way to pass `FlexUrlOptions`. Call `FlexUrl::make()`/`FlexUrl::from()`
directly when you need `strictCommaEncoding` or any other future option.
{% endhint %}
{% endtab %}
{% endtabs %}

## Reading a URL back

```
GET /posts?filter[status]=published&sort=-created_at&page[number]=2
```

{% tabs %}
{% tab title="TypeScript" %}
```ts
const parsed = flexUrl(window.location.href);

parsed.getFilter('status');   // "published"
parsed.getSorts();            // [{attribute: 'created_at', direction: 'desc'}]
parsed.getPage();             // 2
```
{% endtab %}

{% tab title="PHP" %}
```php
$parsed = FlexUrl::from($request->fullUrl());

$parsed->getFilter('status');   // "published"
$parsed->getSorts();            // [['attribute' => 'created_at', 'direction' => 'desc']]
$parsed->getPage();             // 2
```
{% endtab %}
{% endtabs %}

See [Reading State Back](../reading-urls/reading-state.md) for the full reader API.

## Next steps

* [Filters](../building-urls/filters.md), [Sorting](../building-urls/sorting.md), and the rest of
  the grammar under **Building URLs**.
* [Encoding Contract](../advanced/encoding-contract.md) for exactly how values are
  percent-encoded and commas are treated.
* [Typed Schemas](../advanced/typed-schemas.md) (TypeScript) to narrow the builder to a specific
  endpoint's vocabulary at compile time.
