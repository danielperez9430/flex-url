<?php

declare(strict_types=1);

namespace OpenSoutheners\FlexUrl\Internal;

/**
 * The WHATWG Encoding Standard's UTF-8 decoder (§4.2), implemented byte for
 * byte so that malformed input produces *exactly* the same string here as
 * JavaScript's `new TextDecoder('utf-8')` produces in the TypeScript mirror.
 *
 * Why not `mb_scrub()`/`mb_convert_encoding()`: it substitutes `?` (U+003F),
 * not U+FFFD, so the two implementations would disagree on every non-UTF-8
 * byte — and mbstring is an extension this zero-dependency package doesn't
 * require. The replacement *positions* mbstring picks do match the WHATWG
 * algorithm; only the character differs. Rather than mutate the global
 * `mb_substitute_character()` state from inside a library, the ~40 lines of
 * state machine below are written out.
 *
 * The subtle part is the malformed-continuation branch: a byte outside the
 * expected continuation range emits one U+FFFD and is then *reprocessed* as a
 * fresh sequence start (`$index` is not advanced), which is what makes
 * `C3 28` decode to `U+FFFD (` rather than swallowing the `(`.
 *
 * @internal
 */
final class Utf8
{
    private const REPLACEMENT = "\u{FFFD}";

    private function __construct() {}

    /** Returns `$bytes` as valid UTF-8, replacing malformed sequences with U+FFFD. */
    public static function scrub(string $bytes): string
    {
        // `//u` fails to compile the (empty) pattern against invalid UTF-8 subjects,
        // which makes it a dependency-free validity check — and the fast path for
        // the overwhelmingly common case of input that is already valid.
        if (preg_match('//u', $bytes) === 1) {
            return $bytes;
        }

        $output = '';
        $pending = '';
        $bytesSeen = 0;
        $bytesNeeded = 0;
        $lowerBoundary = 0x80;
        $upperBoundary = 0xBF;
        $length = strlen($bytes);
        $index = 0;

        while ($index < $length) {
            $byte = ord($bytes[$index]);

            if ($bytesNeeded === 0) {
                $index++;

                if ($byte <= 0x7F) {
                    $output .= chr($byte);
                } elseif ($byte >= 0xC2 && $byte <= 0xDF) {
                    $bytesNeeded = 1;
                    $pending = chr($byte);
                } elseif ($byte >= 0xE0 && $byte <= 0xEF) {
                    // Tightened bounds reject overlong forms (E0 80..9F) and
                    // UTF-16 surrogates (ED A0..BF) at the continuation byte.
                    if ($byte === 0xE0) {
                        $lowerBoundary = 0xA0;
                    }

                    if ($byte === 0xED) {
                        $upperBoundary = 0x9F;
                    }

                    $bytesNeeded = 2;
                    $pending = chr($byte);
                } elseif ($byte >= 0xF0 && $byte <= 0xF4) {
                    // Likewise for overlongs (F0 80..8F) and past U+10FFFF (F4 90..BF).
                    if ($byte === 0xF0) {
                        $lowerBoundary = 0x90;
                    }

                    if ($byte === 0xF4) {
                        $upperBoundary = 0x8F;
                    }

                    $bytesNeeded = 3;
                    $pending = chr($byte);
                } else {
                    // A continuation byte with nothing to continue, or C0/C1/F5..FF.
                    $output .= self::REPLACEMENT;
                }

                continue;
            }

            if ($byte < $lowerBoundary || $byte > $upperBoundary) {
                $pending = '';
                $bytesSeen = 0;
                $bytesNeeded = 0;
                $lowerBoundary = 0x80;
                $upperBoundary = 0xBF;
                $output .= self::REPLACEMENT;

                // Deliberately no `$index++` — this byte starts a new sequence.
                continue;
            }

            $lowerBoundary = 0x80;
            $upperBoundary = 0xBF;
            $pending .= chr($byte);
            $bytesSeen++;
            $index++;

            if ($bytesSeen === $bytesNeeded) {
                // The boundary checks above already excluded every overlong,
                // surrogate and out-of-range form, so `$pending` is valid UTF-8
                // as-is and can be appended without re-encoding.
                $output .= $pending;
                $pending = '';
                $bytesSeen = 0;
                $bytesNeeded = 0;
            }
        }

        // Input ended mid-sequence.
        if ($bytesNeeded !== 0) {
            $output .= self::REPLACEMENT;
        }

        return $output;
    }
}
