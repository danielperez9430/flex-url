---
description: How flex-url percent-encodes values, treats commas, and parses malformed or non-UTF-8 input — identically in both languages.
---

# Encoding Contract

Both packages implement the exact same encoding rules over the exact same byte sequences, verified
by [shared cross-language fixtures](../testing-and-parity.md). This page is the contract; if a
TypeScript and PHP builder ever disagree on one of these rules, that's a bug.

* Structural brackets (`filter[attr][op]`) and the comma that separates multiple values
  (`filter[status]=published,draft`) are emitted **raw**, matching apiable's own idiom and its
  generated pagination links.
* Every individual value is percent-encoded (matching JavaScript's `encodeURIComponent`)
  *before* being joined into a list, so a literal bracket/space/`%`/`=`/`&` inside one value can
  never be confused with the structural characters.
* Parsing accepts **both** raw and percent-encoded brackets on input — apiable's own pagination
  `links` use `page%5Bnumber%5D`.
* Parsing uses `application/x-www-form-urlencoded` semantics for the query string — what
  `URLSearchParams`, HTML GET forms, PHP's `$_GET`, and Laravel's `Request::query()` all do: a raw
  `+` decodes to a **space**, `%2B` to a literal plus. Serialising never emits `+` (a space is
  `%20`), so re-rendering a parsed URL always means the same thing to the server as the original
  did.
* Parsing never throws and never produces invalid UTF-8. A `%` that isn't followed by two hex
  digits is a literal `%`, and bytes that don't form valid UTF-8 become U+FFFD. Both packages run
  the same three steps over the same bytes, so they return identical strings for identical input —
  malformed input included.

```
flexUrl('/posts').filter('title', ['a', 'b']).toString();
// "/posts?filter[title]=a,b"

flexUrl('/posts?filter[title]=a,b').getFilter('title');       // ["a", "b"]
flexUrl('/posts?filter%5Btitle%5D=a%2Cb').getFilter('title'); // ["a", "b"] — same, after a round-trip

flexUrl('/posts?q=Smith%2C%20John').getSearch();  // "Smith, John" — scalar, not split
flexUrl('http://x/y?page%5Bnumber%5D=2').getPage(); // 2

flexUrl('/posts?filter[discount]=20%').getFilter('discount'); // "20%" — literal, not a broken escape
flexUrl('/posts?q=hello+world').getSearch();                  // "hello world"
flexUrl('/posts?q=C%2B%2B').getSearch();                      // "C++"
```

## A comma is always a separator (default behaviour)

By default, a comma in a list-valued param (`filter`/`sort`/`include`/`fields`/`appends`) is
**always a separator**, whether it arrives raw or as `%2C`. Lists are decoded first and split
afterwards, and a comma inside a value is emitted raw rather than escaped.

apiable does the same thing server-side — `explode(',', $decodedValue)` for `filter`, `sort`,
`include`, `fields`, and `appends` — so `%2C` and `,` were never distinguishable server-side, and
pretending otherwise made flex-url report one opaque value for a URL the backend actually filters
by several. It also could not survive a round-trip: Symfony's `normalizeQueryString()` (behind
Laravel's `fullUrl()`, and so behind every Inertia response) rewrites `filter[a]=1,2` as
`filter%5Ba%5D=1%2C2`.

{% hint style="warning" %}
A comma inside a single list value is therefore **not representable** by default — the same
limitation as OpenAPI's `style: form, explode: false`. See `strictCommaEncoding` below for the
opt-in escape hatch. Scalar params (`q`, `page[...]`, `param()`) are always unaffected — nothing
splits them, so their commas stay literal regardless of this setting.
{% endhint %}

## `strictCommaEncoding`: preserving a literal comma inside a value

Passing `strictCommaEncoding: true` (TS) / `new FlexUrlOptions(strictCommaEncoding: true)` (PHP)
restores the pre-3.0 behaviour opt-in for list values: a value is split on a **raw** `,` only,
decoding each resulting piece afterwards — instead of decoding first and splitting on whatever
commas fall out. A percent-encoded comma (`%2C`) inside one value stays literal, while a real
separator comma still splits.

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts', undefined, {strictCommaEncoding: true})
  .filter('title', ['a,b', 'c'])
  .toString();
// "/posts?filter[title]=a%2Cb,c" — a literal comma survives inside the first value

flexUrl('/posts?filter[title]=a%2Cb,c', undefined, {strictCommaEncoding: true}).getFilter('title');
// ["a,b", "c"]
```
{% endtab %}

{% tab title="PHP" %}
```php
use OpenSoutheners\FlexUrl\FlexUrlOptions;

FlexUrl::make('/posts', new FlexUrlOptions(strictCommaEncoding: true))
    ->filter('title', ['a,b', 'c'])
    ->toString();
// "/posts?filter[title]=a%2Cb,c" — a literal comma survives inside the first value

FlexUrl::make('/posts?filter[title]=a%2Cb,c', new FlexUrlOptions(strictCommaEncoding: true))
    ->getFilter('title');
// ["a,b", "c"]
```
{% endtab %}
{% endtabs %}

{% hint style="info" %}
`filter[title]=foo%2Cbar,baz` under `strictCommaEncoding: true` reads as `["foo,bar", "baz"]` — a
literal comma *and* an OR-alternative in the same value list. A comma inside a single value is
otherwise still not representable — the same limitation as OpenAPI's `style: form,
explode: false`.
{% endhint %}

The option applies to **both** building and parsing — pass it once when constructing the builder
and every list operation (build or read) on that instance honours it. Default is `false` (the
lenient, always-a-separator behaviour above), so existing code is unaffected unless you opt in.

## Percent-encoding a leading `+`

A value you pass to the builder is always percent-encoded, so a leading `+` is safe: a phone
number goes out as `%2B` and parses back identically. The `+`-is-a-space rule only applies to a
raw `+` that was already on the wire — which is what the server reads it as too, so flex-url and
the framework never disagree:

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/contacts').filter('phone', '+34600123456').toString();
// "/contacts?filter[phone]=%2B34600123456" — same as URLSearchParams and any <form>
flexUrl('/contacts?filter[phone]=%2B34600123456').getFilter('phone'); // "+34600123456"

flexUrl('/contacts?filter[phone]=+34600123456').getFilter('phone');   // " 34600123456"
// a hand-written raw "+" — parse_str() and Laravel read that as a space as well
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/contacts')->filter('phone', '+34600123456')->toString();
// "/contacts?filter[phone]=%2B34600123456" — same as any <form> or URLSearchParams
FlexUrl::make('/contacts?filter[phone]=%2B34600123456')->getFilter('phone'); // "+34600123456"

FlexUrl::make('/contacts?filter[phone]=+34600123456')->getFilter('phone');   // " 34600123456"
// a hand-written raw "+" — parse_str() and Laravel read that as a space as well
```
{% endtab %}
{% endtabs %}
