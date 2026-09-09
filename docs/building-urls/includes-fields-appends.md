---
description: Build include=, fields[type]=, and appends[type]= query parameters for compound documents and sparse fieldsets.
---

# Includes, Fields & Appends

## Includes

`include(...relationships)` eager-loads and embeds related resources as a JSON:API compound
document. Dot notation reaches nested relationships. Calls accumulate.

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts').include('project', 'assignee.team');
// /posts?include=project,assignee.team

flexUrl('/posts').include('project').include('tags');
// /posts?include=project,tags
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts')->include('project', 'assignee.team');
// /posts?include=project,assignee.team

FlexUrl::make('/posts')->include('project')->include('tags');
// /posts?include=project,tags
```
{% endtab %}
{% endtabs %}

## Sparse fieldsets

`fields(type, ...columns)` requests a subset of attributes for a given resource type
(`fields[type]=col1,col2`). Multiple calls for the same type accumulate.

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts').fields('post', 'title', 'body');
// /posts?fields[post]=title,body

flexUrl('/posts').fields('post', 'title').fields('author', 'name');
// /posts?fields[post]=title&fields[author]=name
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts')->fields('post', 'title', 'body');
// /posts?fields[post]=title,body

FlexUrl::make('/posts')->fields('post', 'title')->fields('author', 'name');
// /posts?fields[post]=title&fields[author]=name
```
{% endtab %}
{% endtabs %}

## Appends

`append(type, ...accessors)` exposes computed model accessors on demand, using apiable's plural
`appends[type]=` wire key.

{% tabs %}
{% tab title="TypeScript" %}
```ts
flexUrl('/posts').append('post', 'is_overdue');
// /posts?appends[post]=is_overdue
```
{% endtab %}

{% tab title="PHP" %}
```php
FlexUrl::make('/posts')->append('post', 'is_overdue');
// /posts?appends[post]=is_overdue
```
{% endtab %}
{% endtabs %}

## Reading back

```
GET /posts?include=project,tags&fields[post]=title,body&appends[post]=is_overdue
```

{% tabs %}
{% tab title="TypeScript" %}
```ts
const parsed = flexUrl('/posts?include=project,tags&fields[post]=title,body&appends[post]=is_overdue');

parsed.getIncludes();     // ["project", "tags"]
parsed.getFields('post'); // ["title", "body"]
parsed.getFields();       // {post: ["title", "body"]}
parsed.getAppends('post'); // ["is_overdue"]
```
{% endtab %}

{% tab title="PHP" %}
```php
$parsed = FlexUrl::from('/posts?include=project,tags&fields[post]=title,body&appends[post]=is_overdue');

$parsed->getIncludes();     // ["project", "tags"]
$parsed->getFields('post'); // ["title", "body"]
$parsed->getFields();       // ['post' => ['title', 'body']]
$parsed->getAppends('post'); // ["is_overdue"]
```
{% endtab %}
{% endtabs %}

Removing an include/fields/appends entry works the same way as any bucket — see
[Raw Params & Clearing](raw-params-and-clearing.md).
