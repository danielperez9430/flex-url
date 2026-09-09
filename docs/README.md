---
description: An immutable, fluent URL builder/parser for the apiable request-query grammar, available as a TypeScript package and a mirrored PHP package.
---

# Introduction

**Flex Url** is a zero-dependency URL builder/parser for the [Laravel Apiable](https://github.com/open-southeners/laravel-apiable)
request-query grammar — `filter`, `sort`, `include`, `fields`, `appends`, `page` and `q`. It ships
as two mirrored packages from a single monorepo:

* **`flex-url`** on npm — the TypeScript core, ESM + CJS, full type declarations.
* **`open-southeners/flex-url`** on Packagist — the PHP mirror, framework-free.

Method names and wire semantics are kept identical between the two on purpose, so a Vue/Inertia
frontend and a Laravel backend (or a server-rendered Livewire table) speak the exact same URL
grammar without translating between two different mental models.

{% tabs %}
{% tab title="TypeScript" %}
```ts
import {url} from 'flex-url';

url('https://api.example.com/posts')
  .filter('status', 'published')
  .sort('-created_at')
  .include('tags', 'author')
  .page(1)
  .toString();
// => "https://api.example.com/posts?filter[status]=published&sort=-created_at&include=tags,author&page[number]=1"
```
{% endtab %}

{% tab title="PHP" %}
```php
use function flex_url;

flex_url('https://api.example.com/posts')
    ->filter('status', 'published')
    ->sort('-created_at')
    ->include('tags', 'author')
    ->page(1)
    ->toString();
// => "https://api.example.com/posts?filter[status]=published&sort=-created_at&include=tags,author&page[number]=1"
```
{% endtab %}
{% endtabs %}

## Features

* **Immutable** — every builder call returns a *new* instance; nothing is ever mutated in place.
* **Parse = build** — constructing from a URL hydrates the exact same state a builder produces, so
  a URL can be round-tripped through the builder and read back with `getFilter()`, `getSorts()`,
  `getPage()`, and friends.
* **Full URL fidelity** — pathname, port, hash, and any existing query params are preserved.
* **Matches apiable's own encoding idiom** — brackets and commas are raw on the wire, individual
  values are percent-encoded. See [Encoding Contract](advanced/encoding-contract.md).
* **Typed schemas (TypeScript)** — narrow `filter()`/`sort()`/`include()`/`fields()`/`append()` to
  a specific endpoint's allowed vocabulary at compile time, generated straight from apiable's
  `apiable:types` exporter.
* **Framework-free (PHP)** — no Laravel/Illuminate runtime dependency. `toQuery()`/`toRequestUri()`
  give you what you need to dispatch an in-kernel sub-request yourself.
* **Cross-language test parity** — both implementations are tested against the same
  [shared JSON fixtures](testing-and-parity.md), so they can't silently drift apart.

## Requirements

| | TypeScript (`flex-url`) | PHP (`open-southeners/flex-url`) |
|---|---|---|
| Runtime | Node.js 24.x or 26.x | PHP 8.2+ |
| Dependencies | None | None |

## Quick start

{% tabs %}
{% tab title="TypeScript" %}
```bash
npm install flex-url
```
{% endtab %}

{% tab title="PHP" %}
```bash
composer require open-southeners/flex-url
```
{% endtab %}
{% endtabs %}

Then head to the [Installation](getting-started/installation.md) guide, or straight to
[Quick Start](getting-started/quick-start.md) for a tour of the builder API.
