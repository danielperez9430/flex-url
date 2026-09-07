<?php

declare(strict_types=1);

namespace OpenSoutheners\FlexUrl\Tests;

use OpenSoutheners\FlexUrl\Internal\Encoding;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * Mirrors the TypeScript suite's "list encoding round-trips" block.
 *
 * `decodeList()`/`encodeList()` must be stable under repetition: whatever a
 * value decodes to has to survive being re-encoded and decoded again. Encoding
 * a comma as `%2C` broke this — it rendered `a%2Cb` once and `a,b` thereafter —
 * and nothing else in the suite would have caught it, because every fixture
 * starts from a canonical URL rather than an arbitrary one.
 */
class EncodingRoundTripTest extends TestCase
{
    #[DataProvider('rawValues')]
    public function test_list_encoding_is_stable_under_repetition(string $raw): void
    {
        $once = Encoding::decodeList($raw);
        $twice = Encoding::decodeList(Encoding::encodeList($once));

        $this->assertSame($once, $twice);
        $this->assertSame(Encoding::encodeList($once), Encoding::encodeList($twice));
    }

    /**
     * @return array<string, array{0: string}>
     */
    public static function rawValues(): array
    {
        $values = [
            'a,b', 'a%2Cb', 'a%2Cb,c', '', ',', ',,', 'a,,b', 'x%252Cy',
            'Smith%2C%20John', 'a+b,c', '20%,b', '%FF,a', 'é,ü', 'a%3Db,c',
        ];

        $named = [];

        foreach ($values as $value) {
            $named[$value === '' ? '(empty)' : $value] = [$value];
        }

        return $named;
    }
}
