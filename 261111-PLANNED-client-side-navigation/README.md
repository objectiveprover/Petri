# Client-side navigation

**Languages:** TypeScript

## Goal

Navigate between pages without full reloads and without a framework.

- Intercept clicks on internal links.
- `fetch` the next page and swap only `<main>` and the `<title>`.
- Keep the back and forward buttons working with the History API (`pushState` and `popstate`).

This could serve its pages with [261111-DONE-simple-html-templating](../261111-DONE-simple-html-templating).
