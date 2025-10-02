---
title: Test MDX Override
mdx:
  format: 'md'
---

# Test File with Problematic Syntax

This file tests forcing CommonMark parsing via frontmatter.

## Problematic Patterns

1. Angle brackets: <Type>, <filename.ext>
2. Generic types: Array<string>, Record<string, any>
3. Comparisons: value < 10, count <100
4. Complex patterns: <MyComponent prop={value} />

## Should Parse as CommonMark

Since we've set `mdx.format: 'md'` in the frontmatter, this file should be parsed as CommonMark instead of MDX, meaning:

- No JSX parsing
- Angle brackets are treated as literal text
- No need for escaping or sanitization

## Test Cases

- Simple angle: <test>
- Generic: Map<string, number>
- Comparison: if (x < 5)
- Fake component: <Button onClick={() => alert('test')} />

All of the above should render as plain text without causing parsing errors.