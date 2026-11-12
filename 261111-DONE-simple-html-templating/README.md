# Simple HTML templating

**Languages:** TypeScript (Deno)

## Goal

Try a dependency-free way to build HTML pages from a shared layout and reusable components, using regular expressions and placeholder replacement.

How it works:
- A page has a `<Head>` and a `<Template>` section.
- The server extracts both with regexes and puts them into `layout.html` in place of `{{head}}` and `{{body}}`.
- Tags like `<Component1>…</Component1>` are replaced with the matching component file, with the tag's content in place of the component's `{{body}}`. This repeats until nothing changes, so components can contain other components.
- `<style>` blocks inside components go in the page's `<head>`, once per component used on the page.

This is placeholder replacement, not a template language: there are no variables, expressions, loops or conditionals.

## Run

```sh
deno task start
```

Then open http://localhost:8000. Pages, the layout and components are read on every request, so edits show up on reload.

```sh
deno task test
```

### What works
- Abstraction of `<head>`.
- Abstraction of `<body>`.
- Expansion of HTML components inside pages, including components nested inside other components.
- Unknown routes get the 404 page with a 404 status, and errors get the 500 page with a 500 status.
- No dependencies.
- Everything is in a single file.

### Limitations

- A component can't be nested inside itself (`<Box><Box>…</Box></Box>`). The non-greedy regex pairs the outer opening tag with the inner closing tag. I think that will need a proper parser.
- Components don't create a scope for styles or scripts. Their styles are global once they're in the `<head>`.
- Components are registered by hand in `main.ts` instead of being discovered from the file system.
