---
description: Render a builder to a full URL, a request URI, or a relative navigation URL — and when to use each.
---

# Output Forms

`FlexUrl` renders to a string in three shapes. All three share the same query-string rendering —
they differ only in which parts of the URL they include.

| Method | Shape | Includes origin | Includes hash |
|---|---|---|---|
| `toString()` | `origin + pathname?query#hash` | Yes | Yes |
| `toRelativeUrl()` | `pathname?query#hash` | No | Yes |
| `toRequestUri()` | `pathname?query` | No | No |

## `toString()` — the round-trip form

The full URL, including the origin when the builder was constructed from one. This is the
round-trip form: building from a URL and calling `toString()` reproduces it byte-for-byte with the
same normalisation rules (see [Encoding Contract](../advanced/encoding-contract.md)).

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('https://api.example.com/posts?filter[status]=published').filter('status', 'draft').toString();
// "https://api.example.com/posts?filter[status]=draft"
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('https://api.example.com/posts?filter[status]=published')->filter('status', 'draft')->toString();
// "https://api.example.com/posts?filter[status]=draft"

// __toString() is implemented too, so a FlexUrl casts to string directly:
(string) FlexUrl::make('/posts')->filter('status', 'draft');
```
{% endtab %}
{% endtabs %}

## `toRelativeUrl()` — for navigation

`pathname?query#hash` — the origin-relative form for client-side navigation or a redirect target.
The fragment is preserved because it's part of where the user is being sent.

{% tabs %}
{% tab title="TypeScript" %}
Prefer this over `toString()` when navigating client-side.
`history.pushState()`/`replaceState()` throw a `SecurityError` when the origin differs from the
document's — which is exactly what happens once you build from an API URL
(`flexUrl('https://api.example.com/posts')`) and want the app's own address bar to reflect the
filters. `toRelativeUrl()` has no origin to clash.

```ts
const next = flexUrl(window.location.href).filter('status', 'active').page(1);

router.visit(next.toRelativeUrl(), {preserveState: true, preserveScroll: true}); // Inertia
history.replaceState(null, '', next.toRelativeUrl());                            // history API
router.push(next.toRelativeUrl());                                               // vue-router
```

{% hint style="warning" %}
Pass every parameter through flex-url rather than Inertia's `data` option:
`router.visit(url, {data})` re-serialises the whole query string through `qs`, which
percent-encodes the commas apiable expects raw.
{% endhint %}
{% endtab %}

{% tab title="PHP" %}
Use `toRelativeUrl()` when producing a link or a redirect target rather than a request — the
counterpart to `toRequestUri()`, which drops the fragment because fragments are never sent to the
server:

```php
$flexUrl = FlexUrl::make('https://app.example.com/projects#activity')->filter('status', 'active');

$flexUrl->toRelativeUrl(); // "/projects?filter[status]=active#activity"
$flexUrl->toRequestUri();  // "/projects?filter[status]=active"

return redirect()->to($flexUrl->toRelativeUrl());
```
{% endtab %}
{% endtabs %}

## `toRequestUri()` — what actually reaches the server

`pathname?query` — never scheme/host/fragment. The part that actually reaches the server: for
`fetch()`, log lines, cache keys, and in-kernel sub-requests. Both packages implement it with
**identical semantics**, so a fixture can assert one value for both mirrors.

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('https://api.example.com/posts#top').filter('status', 'active').toRequestUri();
// "/posts?filter[status]=active"
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('https://api.example.com/posts#top')->filter('status', 'active')->toRequestUri();
// "/posts?filter[status]=active"
```

Pair with PHP's [`toQuery()`](params-and-query-arrays.md#toquery-php-only) to dispatch an in-kernel
sub-request against an apiable endpoint from server-rendered UI (e.g. a Livewire component):

```php
$flexUrl = FlexUrl::make('/api/v1/projects')->filter('status', 'active')->sort('name')->page(2);

$request = Illuminate\Http\Request::create($flexUrl->toRequestUri(), 'GET');
$response = app(Illuminate\Contracts\Http\Kernel::class)->handle($request);
```
{% endtab %}
{% endtabs %}
