/**
 * Type-level tests for the `EndpointSchema` generic. `expectTypeOf(...)` calls
 * are compile-time-only assertions checked by `tsc --noEmit` (the `typecheck`
 * script) — at runtime they're inert, so this file also runs harmlessly under
 * plain `vitest run`. `@ts-expect-error` lines assert the opposite: that a
 * particular call is a compile error for a typed builder — `tsc` fails the
 * build if the marked line *doesn't* error (an "unused directive" diagnostic).
 */
import {describe, expectTypeOf, it} from 'vitest';

import {flexUrl, type EndpointSchema, type FlexUrl} from '../src/index.js';

interface IssuesSchema extends EndpointSchema {
  resource: 'issues';
  path: '/api/v1/issues';
  filters: {
    status: {operators: ['equal']; values: ['open', 'closed']};
    due_at: {operators: ['gte', 'lte']};
    overdue: {operators: ['scope']};
  };
  sorts: ['priority', 'due_at', 'project.name'];
  includes: ['project', 'assignee', 'labels'];
  fields: {issues: ['title', 'status', 'priority']};
  appends: {issues: ['is_overdue']};
}

describe('typed EndpointSchema narrowing (compile-time only)', () => {
  it('untyped usage keeps every argument as `string` — no schema required', () => {
    const untyped = flexUrl('/posts');

    expectTypeOf(untyped.filter).parameter(0).toBeString();
    expectTypeOf(untyped).toEqualTypeOf<FlexUrl<undefined>>();

    // Any string is accepted without a schema.
    untyped.filter('anything', 'anything');
    untyped.sort('anything');
    untyped.include('anything');
  });

  it('a schema argument narrows filter/sort/include/fields/appends to its allowed vocabulary', () => {
    const issuesSchema: IssuesSchema = {
      resource: 'issues',
      path: '/api/v1/issues',
      filters: {
        status: {operators: ['equal'], values: ['open', 'closed']},
        due_at: {operators: ['gte', 'lte']},
        overdue: {operators: ['scope']},
      },
      sorts: ['priority', 'due_at', 'project.name'],
      includes: ['project', 'assignee', 'labels'],
      fields: {issues: ['title', 'status', 'priority']},
      appends: {issues: ['is_overdue']},
    };

    const typed = flexUrl('/api/v1/issues', issuesSchema);

    expectTypeOf(typed).toEqualTypeOf<FlexUrl<IssuesSchema>>();

    // Valid, schema-allowed calls compile cleanly.
    typed.filter('status', 'open');
    typed.filter('due_at', 'gte', '2024-01-01');
    typed.sort('priority');
    typed.sort('-due_at');
    typed.include('project', 'assignee');
    typed.fields('issues', 'title', 'status');
    typed.append('issues', 'is_overdue');

    // @ts-expect-error "budget" isn't a filter attribute on IssuesSchema.
    typed.filter('budget', 'anything');

    // @ts-expect-error "gte" was never registered for "status" — only "equal" was.
    typed.filter('status', 'gte', 'open');

    // @ts-expect-error "created_at" isn't a sort attribute on IssuesSchema.
    typed.sort('created_at');

    // @ts-expect-error "comments" isn't an includable relationship on IssuesSchema.
    typed.include('comments');

    // @ts-expect-error "comments" isn't a fields() resource type on IssuesSchema.
    typed.fields('comments', 'body');
  });

  it('an explicit generic narrows without a runtime schema object', () => {
    const typed = flexUrl<IssuesSchema>('/api/v1/issues');

    typed.filter('status', 'open');

    // @ts-expect-error same narrowing applies without a runtime schema.
    typed.filter('budget', 'anything');
  });

  it('an `as const` schema literal (as apiable\'s exporter emits) assigns to `EndpointSchema` and narrows', () => {
    // Every array/record-of-array property comes back `readonly` under `as
    // const` — this must satisfy `EndpointSchema` directly, with no `as`
    // cast, since that's exactly the shape apiable's `apiable:types`
    // exporter generates for consumers.
    const constSchema = {
      resource: 'issues',
      path: '/api/v1/issues',
      filters: {
        status: {operators: ['equal'], values: ['open', 'closed']},
        due_at: {operators: ['gte', 'lte']},
        overdue: {operators: ['scope']},
      },
      sorts: ['priority', 'due_at', 'project.name'],
      includes: ['project', 'assignee', 'labels'],
      fields: {issues: ['title', 'status', 'priority']},
      appends: {issues: ['is_overdue']},
    } as const satisfies EndpointSchema;

    const typed = flexUrl('/api/v1/issues', constSchema);

    // Narrowing still comes from the literal `as const` types, not just
    // structural `EndpointSchema`, since flexUrl() is generic over the
    // schema argument's inferred type.
    typed.filter('status', 'open');
    typed.filter('due_at', 'gte', '2024-01-01');
    typed.sort('priority');
    typed.sort('-due_at');
    typed.include('project', 'assignee');
    typed.fields('issues', 'title', 'status');
    typed.append('issues', 'is_overdue');

    // @ts-expect-error "budget" isn't a filter attribute on the `as const` schema.
    typed.filter('budget', 'anything');

    // @ts-expect-error "created_at" isn't a sort attribute on the `as const` schema.
    typed.sort('created_at');

    // @ts-expect-error "comments" isn't an includable relationship on the `as const` schema.
    typed.include('comments');
  });
});
