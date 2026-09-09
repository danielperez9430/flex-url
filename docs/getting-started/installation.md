---
description: Install the TypeScript or PHP flex-url package.
---

# Installation

{% tabs %}
{% tab title="TypeScript" %}
## Requirements

* Node.js 24.x (Active LTS) or 26.x (Current)

## Installing the package

```bash
npm install flex-url
```

The package ships both ESM and CJS builds with full type declarations — no separate `@types`
package needed.

## Importing

```ts
import {flexUrl, url, FlexUrl} from 'flex-url';
// `url` is an alias for `flexUrl`.
```

The JSON:API `links`/`meta` pagination helpers live at a separate entry point so they can be
tree-shaken out when unused:

```ts
import {links, meta, nextUrl, prevUrl} from 'flex-url/links';
```

See [JSON:API Links Helper](../advanced/json-api-links.md).
{% endtab %}

{% tab title="PHP" %}
## Requirements

* PHP 8.2 or higher

## Installing the package

```bash
composer require open-southeners/flex-url
```

## Importing

```php
use OpenSoutheners\FlexUrl\FlexUrl;
use OpenSoutheners\FlexUrl\FlexUrlOptions;

// A global helper alias for `FlexUrl::make($url)` is also autoloaded:
use function flex_url;
```

No service provider, facade, or Laravel integration is required — the package has zero runtime
dependencies and works in any PHP 8.2+ codebase.
{% endtab %}
{% endtabs %}

## Next steps

Continue to [Quick Start](quick-start.md) for a tour of the builder and reader API.
