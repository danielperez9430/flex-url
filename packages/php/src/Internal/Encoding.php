<?php

declare(strict_types=1);

namespace OpenSoutheners\FlexUrl\Internal;

/**
 * Encoding contract (mirrored from the TypeScript core's `encoding.ts` — do
 * not change without updating both, plus `fixtures/cases.json`):
 *
 * - Structural brackets (`filter[attr][op]`) and the comma that separates
 *   multiple values in a list (`filter[status]=published,draft`) are emitted
 *   RAW on output — this matches apiable's own idiom and its generated
 *   pagination links.
 * - Every individual value is percent-encoded the same way JavaScript's
 *   `encodeURIComponent` would *before* being joined into a list. A literal
 *   comma/bracket/space/`%`/`=`/`&` inside one value can never be confused
 *   with the raw commas/brackets used as structural separators.
 * - Parsing is the exact inverse: values are split on RAW commas first
 *   (never on a decoded `%2C`), then each piece is individually decoded.
 *   Keys are decoded as a whole before their bracket structure is parsed, so
 *   `filter[status]` and the percent-encoded `filter%5Bstatus%5D` (as used
 *   by apiable's own pagination links) both parse identically.
 * - `=` is never assumed inside a key/value pair until *after* splitting on
 *   the first raw `=` — decoding before splitting would let an encoded
 *   `%3D` inside a value be mistaken for the key/value separator.
 *
 * @internal
 */
final class Encoding
{
    /** Characters `rawurlencode()` (RFC 3986) escapes that `encodeURIComponent` (JS) does not. */
    private const UNRESERVED_MARKS = [
        '%21' => '!',
        '%27' => "'",
        '%28' => '(',
        '%29' => ')',
        '%2A' => '*',
    ];

    private function __construct() {}

    /** Percent-encode a single scalar value for the wire, matching `encodeURIComponent`. */
    public static function encodeValue(string $value): string
    {
        return strtr(rawurlencode($value), self::UNRESERVED_MARKS);
    }

    /** Percent-decode a single scalar value read off the wire. */
    public static function decodeValue(string $raw): string
    {
        return rawurldecode($raw);
    }

    /**
     * Encode a list of values into their raw-comma-joined wire representation.
     *
     * @param  list<string>  $values
     */
    public static function encodeList(array $values): string
    {
        return implode(',', array_map(self::encodeValue(...), $values));
    }

    /**
     * Split a raw (still percent-encoded) value on literal commas — never on
     * a decoded `%2C` — then decode each resulting piece individually. An
     * empty raw string yields an empty list rather than `['']`.
     *
     * @return list<string>
     */
    public static function decodeList(string $raw): array
    {
        if ($raw === '') {
            return [];
        }

        return array_map(self::decodeValue(...), explode(',', $raw));
    }

    /** Encode a single key segment (attribute/type/operator name) for use inside brackets. */
    public static function encodeKeySegment(string $segment): string
    {
        return self::encodeValue($segment);
    }

    /**
     * Build a bracketed wire key, e.g. `buildKey('filter', ['due_at', 'gte'])`
     * -> `"filter[due_at][gte]"`. An empty `path` yields the base key unchanged.
     *
     * @param  list<string>  $path
     */
    public static function buildKey(string $base, array $path = []): string
    {
        $key = self::encodeKeySegment($base);

        foreach ($path as $segment) {
            $key .= '['.self::encodeKeySegment($segment).']';
        }

        return $key;
    }

    /**
     * Parse a fully-decoded key string into its base segment and bracket
     * path, e.g. `"filter[due_at][gte]"` -> `['base' => 'filter', 'path' =>
     * ['due_at', 'gte']]`. Malformed bracket structure degrades gracefully to
     * `['base' => $decodedKey, 'path' => []]`.
     *
     * @return array{base: string, path: list<string>}
     */
    public static function parseKey(string $decodedKey): array
    {
        if (preg_match('/^([^\[\]]+)((?:\[[^\[\]]*])*)$/', $decodedKey, $matches) !== 1) {
            return ['base' => $decodedKey, 'path' => []];
        }

        $path = [];

        if (preg_match_all('/\[([^\[\]]*)]/', $matches[2], $pathMatches) > 0) {
            $path = $pathMatches[1];
        }

        return ['base' => $matches[1], 'path' => $path];
    }

    /**
     * Parse a full query string (with or without a leading `?`) into ordered
     * entries.
     *
     * @return list<array{base: string, path: list<string>, rawValue: string}>
     */
    public static function parseQueryString(string $search): array
    {
        $trimmed = str_starts_with($search, '?') ? substr($search, 1) : $search;

        if ($trimmed === '') {
            return [];
        }

        $entries = [];

        foreach (explode('&', $trimmed) as $pair) {
            if ($pair === '') {
                continue;
            }

            $equalsIndex = strpos($pair, '=');
            $rawKey = $equalsIndex === false ? $pair : substr($pair, 0, $equalsIndex);
            $rawValue = $equalsIndex === false ? '' : substr($pair, $equalsIndex + 1);
            $keyParts = self::parseKey(self::decodeValue($rawKey));

            $entries[] = [
                'base' => $keyParts['base'],
                'path' => $keyParts['path'],
                'rawValue' => $rawValue,
            ];
        }

        return $entries;
    }
}
