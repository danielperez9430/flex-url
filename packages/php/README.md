## open-southeners/flex-url

<img src="https://raw.githubusercontent.com/open-southeners/partners/main/logos/open_southeners_logo.png" alt="" align="left" height="64">

An immutable, fluent URL builder/parser for the [Laravel Apiable](https://github.com/open-southeners/laravel-apiable) request-query grammar. Zero runtime dependencies, framework-free.

[![packagist version](https://img.shields.io/packagist/v/open-southeners/flex-url)](https://packagist.org/packages/open-southeners/flex-url) [![required php version](https://img.shields.io/packagist/php-v/open-southeners/flex-url)](https://www.php.net/supported-versions.php) [![Test](https://github.com/open-southeners/flex-url/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/open-southeners/flex-url/actions/workflows/tests.yml) [![codecov](https://codecov.io/gh/open-southeners/flex-url/branch/main/graph/badge.svg)](https://codecov.io/gh/open-southeners/flex-url) [![Edit on VSCode online](https://img.shields.io/badge/vscode-edit%20online-blue?logo=visualstudiocode)](https://vscode.dev/github/open-southeners/flex-url)

## Installation

```bash
composer require open-southeners/flex-url
```

## Usage

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

## Documentation

[Official documentation](https://docs.opensoutheners.com/flex-url/)

## TypeScript mirror

A TypeScript core with identical method names/semantics lives alongside this package at
[`packages/js`](../js) (`flex-url` on npm). Both implementations are tested against the same
shared JSON fixtures so they can't silently drift apart.

## License

This package is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
