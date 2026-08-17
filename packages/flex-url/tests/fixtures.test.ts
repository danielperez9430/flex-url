/**
 * Replays `fixtures/cases.json` — the language-neutral contract shared with
 * the PHPUnit suite (see `fixtures/SCHEMA.md`). Every case's `build` steps
 * are applied in order to a fresh builder from `base`, the result is
 * compared against `url`, and (when present) every `reads` assertion is
 * checked against a fresh builder parsed straight back from that `url`.
 */
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

import {describe, expect, it} from 'vitest';

import {flexUrl} from '../src/index.js';

interface FixtureOperation {
  op: string;
  args: unknown[];
}

interface FixtureRead extends FixtureOperation {
  equals: unknown;
}

interface FixtureCase {
  name: string;
  base: string;
  build: FixtureOperation[];
  url: string;
  reads?: FixtureRead[];
}

const fixturesPath = fileURLToPath(new URL('../../../fixtures/cases.json', import.meta.url));
const cases = JSON.parse(readFileSync(fixturesPath, 'utf8')) as FixtureCase[];

// A generic runner necessarily calls methods dynamically by name — indexing with `any` is the point here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyBuilder = any;

describe('shared fixtures (fixtures/cases.json)', () => {
  it('is not empty', () => {
    expect(cases.length).toBeGreaterThan(0);
  });

  for (const testCase of cases) {
    it(testCase.name, () => {
      let builder: AnyBuilder = flexUrl(testCase.base);

      for (const step of testCase.build) {
        builder = builder[step.op](...step.args);
      }

      expect(builder.toString()).toBe(testCase.url);

      if (!testCase.reads) return;

      const reader: AnyBuilder = flexUrl(testCase.url);

      for (const read of testCase.reads) {
        expect(reader[read.op](...read.args)).toEqual(read.equals);
      }
    });
  }
});
