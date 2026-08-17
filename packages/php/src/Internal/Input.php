<?php

declare(strict_types=1);

namespace OpenSoutheners\FlexUrl\Internal;

/**
 * Parses a starting URL/path into its origin/pathname/search/hash parts —
 * mirrors the TypeScript core's `input.ts`. Every part is preserved so it
 * can be round-tripped through `FlexUrl::toString()`, including the
 * pathname (silently dropped by flex-url v1).
 *
 * @internal
 */
final class Input
{
    private const DEFAULT_PORTS = [
        'http' => 80,
        'https' => 443,
    ];

    private function __construct() {}

    /**
     * Accepts an absolute URL, a relative path (`/posts`, `posts?foo=bar`,
     * `#hash`), or an empty string (a "bare" builder that renders just the
     * query string).
     *
     * @return array{origin: string, pathname: string, search: string, hash: string}
     */
    public static function parse(string $input): array
    {
        if ($input === '') {
            return ['origin' => '', 'pathname' => '', 'search' => '', 'hash' => ''];
        }

        $parts = parse_url($input);

        if ($parts === false) {
            // Malformed input `parse_url()` refuses to touch at all: treat it as a bare pathname.
            return ['origin' => '', 'pathname' => $input, 'search' => '', 'hash' => ''];
        }

        return [
            'origin' => self::origin($parts),
            'pathname' => $parts['path'] ?? '',
            'search' => isset($parts['query']) ? "?{$parts['query']}" : '',
            'hash' => isset($parts['fragment']) ? "#{$parts['fragment']}" : '',
        ];
    }

    /**
     * @param  array{scheme?: string, host?: string, port?: int}  $parts
     */
    private static function origin(array $parts): string
    {
        if (! isset($parts['host'])) {
            return '';
        }

        $scheme = $parts['scheme'] ?? 'https';
        $origin = "{$scheme}://{$parts['host']}";

        if (isset($parts['port']) && (self::DEFAULT_PORTS[$scheme] ?? null) !== $parts['port']) {
            $origin .= ":{$parts['port']}";
        }

        return $origin;
    }
}
