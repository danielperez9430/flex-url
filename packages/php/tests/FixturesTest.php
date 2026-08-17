<?php

declare(strict_types=1);

namespace OpenSoutheners\FlexUrl\Tests;

use OpenSoutheners\FlexUrl\FlexUrl;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * Replays `fixtures/cases.json` — the language-neutral contract shared with
 * the Vitest suite (see `fixtures/SCHEMA.md`). Every case's `build` steps
 * are applied in order to a fresh builder from `base`, the result is
 * compared against `url`, and (when present) every `reads` assertion is
 * checked against a fresh builder parsed straight back from that `url`.
 */
class FixturesTest extends TestCase
{
    public function test_fixtures_file_is_not_empty(): void
    {
        $this->assertNotEmpty(self::cases());
    }

    /**
     * @param  array{name: string, base: string, build: list<array{op: string, args: list<mixed>}>, url: string, reads?: list<array{op: string, args: list<mixed>, equals: mixed}>}  $testCase
     */
    #[DataProvider('cases')]
    public function test_case(array $testCase): void
    {
        $builder = FlexUrl::make($testCase['base']);

        foreach ($testCase['build'] as $step) {
            $builder = $builder->{$step['op']}(...$step['args']);
        }

        $this->assertSame($testCase['url'], $builder->toString());

        if (! isset($testCase['reads'])) {
            return;
        }

        $reader = FlexUrl::make($testCase['url']);

        foreach ($testCase['reads'] as $read) {
            $this->assertEquals($read['equals'], $reader->{$read['op']}(...$read['args']), "read op \"{$read['op']}\" for fixture \"{$testCase['name']}\"");
        }
    }

    /**
     * @return array<string, array{0: array<string, mixed>}>
     */
    public static function cases(): array
    {
        $path = __DIR__.'/../../../fixtures/cases.json';

        /** @var list<array<string, mixed>> $cases */
        $cases = json_decode((string) file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);

        $named = [];

        foreach ($cases as $case) {
            /** @var string $name */
            $name = $case['name'];
            $named[$name] = [$case];
        }

        return $named;
    }
}
