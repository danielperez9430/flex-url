---
description: Construct a FlexUrl from a PSR-7 UriInterface or a Laravel Request without adding a framework dependency.
---

# PSR-7 & Requests (PHP)

{% hint style="info" %}
This is a PHP-only page. The TypeScript package's equivalent input flexibility (accepting a plain
string or a `URL` instance) is covered in [Quick Start](../getting-started/quick-start.md#constructing-a-builder).
{% endhint %}

`FlexUrl::from()` accepts a plain `string` or anything `Stringable` — this covers PSR-7's
`UriInterface` (it declares `__toString(): string`, which PHP treats as implementing `Stringable`
automatically) **without** adding `psr/http-message` as a dependency:

```php
FlexUrl::from($psrUri);                 // any PSR-7 UriInterface
FlexUrl::from($request->fullUrl());     // Illuminate\Http\Request — pass the string, stay framework-free
```

`FlexUrl::make()` is the same entry point with an `?string` parameter (no `Stringable` — for the
common case of a plain path or URL string, or `null` for a bare builder):

```php
FlexUrl::make(null);                    // bare builder, renders just a query string
FlexUrl::make($request->fullUrl());     // string works here too
```

{% hint style="warning" %}
The package deliberately has **no** hard dependency on `illuminate/http` or `psr/http-message` —
it stays framework-free so it can be used in any PHP 8.2+ codebase. Pass the already-resolved
string/`Stringable` from whichever HTTP layer you're using; don't expect `FlexUrl` to accept a
`Request` object directly.
{% endhint %}

## Dispatching an in-kernel sub-request

`toQuery()` and `toRequestUri()` are shaped to match `Illuminate\Http\Request` without depending on
it, which makes them useful for dispatching an in-kernel sub-request against an apiable endpoint
from server-rendered UI — e.g. a Livewire component driving `/api/v1/projects`:

```php
$flexUrl = FlexUrl::make('/api/v1/projects')->filter('status', 'active')->sort('name')->page(2);

$flexUrl->toQuery();
// ['filter' => ['status' => 'active'], 'sort' => 'name', 'page' => ['number' => '2']]
// — same shape Illuminate\Http\Request::query() would hold (built via parse_str()).

$flexUrl->toRequestUri();
// "/api/v1/projects?filter[status]=active&sort=name&page[number]=2"

$request = Illuminate\Http\Request::create($flexUrl->toRequestUri(), 'GET');
$response = app(Illuminate\Contracts\Http\Kernel::class)->handle($request);
```

See [`toParams()` & `toQuery()`](../reading-urls/params-and-query-arrays.md) for the difference
between the two output shapes.
