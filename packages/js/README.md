## flex-url

<img src="https://raw.githubusercontent.com/open-southeners/partners/main/logos/open_southeners_logo.png" alt="" align="left" height="64">

An immutable, fluent URL builder/parser for the [Laravel Apiable](https://github.com/open-southeners/laravel-apiable) request-query grammar. Zero runtime dependencies, ESM + CJS, full type declarations.

[![npm version](https://img.shields.io/npm/v/flex-url)](https://npmjs.com/package/flex-url) [![Test](https://github.com/open-southeners/flex-url/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/open-southeners/flex-url/actions/workflows/tests.yml) [![codecov](https://codecov.io/gh/open-southeners/flex-url/branch/main/graph/badge.svg)](https://codecov.io/gh/open-southeners/flex-url) [![Edit on VSCode online](https://img.shields.io/badge/vscode-edit%20online-blue?logo=visualstudiocode)](https://vscode.dev/github/open-southeners/flex-url)

## Installation

```bash
npm install flex-url
```

## Usage

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

## Documentation

[Official documentation](https://docs.opensoutheners.com/flex-url/)

## PHP mirror

A PHP port with identical method names/semantics lives alongside this package at
[`packages/php`](../php) (`open-southeners/flex-url` on Packagist) for server-driven tables (e.g.
Livewire). Both implementations are tested against the same shared JSON fixtures so they can't
silently drift apart.

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
