/**
 * The same compile-time contract as `types.test.ts`, re-checked with
 * `strictNullChecks` off via `tsconfig.loose.json` (`npm run typecheck` runs
 * both passes).
 *
 * Without `strictNullChecks`, `undefined` is assignable to every type, so the
 * `S extends EndpointSchema` test in `types.ts` is *true* for the no-schema
 * default and every attribute argument used to collapse to `never` — untyped
 * usage did not compile at all. A plain `tsc` run can't catch that regression,
 * because the package's own tsconfig is strict.
 *
 * Runtime assertions are deliberate: this file has to be a real test so
 * `vitest` executes it, but the point is that `tsc -p tsconfig.loose.json`
 * accepts it.
 */
import {describe, expect, it} from 'vitest';

import {flexUrl, url} from '../../src/index.js';

describe('untyped usage compiles without strictNullChecks', () => {
  it('accepts any attribute name across every builder method', () => {
    const built = flexUrl('/posts')
      .filter('owner', 'me')
      .filter('due_at', 'gte', '2024-01-01')
      .between('created_at', '2024-01-01', '2024-01-31')
      .sort('priority')
      .sortDesc('created_at')
      .include('project', 'assignee.team')
      .fields('post', 'title', 'body')
      .append('post', 'is_overdue')
      .page(2)
      .pageSize(25)
      .search('laravel')
      .searchFilter('status', 'published')
      .param('debug', '1');

    expect(built.getFilter('owner')).toBe('me');
    expect(built.toString()).toContain('filter[owner]=me');
  });

  it('works through the `url` alias too', () => {
    expect(url('/posts').filter('anything', 'goes').toString()).toBe('/posts?filter[anything]=goes');
  });

  it('covers the filter-value operations and the readers that return unions', () => {
    const built = flexUrl('/posts')
      .addFilterValue('char', 'A')
      .addFilterValue('char', 'B')
      .toggleFilterValue('char', 'C')
      .removeFilterValue('char', 'A')
      .param('debug', '1');

    // `getParam()` and `getFilter()` return `... | undefined`, which is where a
    // union involving `undefined` would behave differently without strictNullChecks.
    expect(built.getParam('debug')).toBe('1');
    expect(built.getFilter('char')).toEqual(['B', 'C']);
    expect(built.getFilters()).toEqual([{attribute: 'char', operator: '', values: ['B', 'C']}]);
  });
});
