# Petri

The purpose of this repository is to store and track small pieces of code and algorithms in different programming languages, usually to practice and make tests for larger projects or just for curiosity when trying languages.

## Organization

- Every experiment is a folder named `YYMMDD-STATUS-topic`, so a directory listing shows both the order and the state of everything.
  - `YYMMDD` is the date it was created, planned or started. It never changes, so folders stay in chronological order.
  - `STATUS` is one of `PLANNED`, `ONGOING`, `DONE` or `ABANDONED`. Rename status with `git mv` to keep track of them.
  - `topic` what the code is. For books and papers, the topic should start with a short name of the source, for example `raft-consensus` or `crafting-interpreters-scanner`.
- `PLANNED` means not started yet, whether it's my own idea or something from a book or paper. A planned experiment is a folder with only a `README.md`: a title, the languages and a **Goal**. Taking notes while reading a paper already counts as `ONGOING`, even before there's code.
- Every experiment has a `README.md` with **Goal**, **Run** and **Findings**. Books and papers also get a **Source** line.
- When one experiment is tried in several languages, each version goes in its own subfolder (`python/`, `clojure/`, …).
- Toolchain-specific ignores (`node_modules`, `dist`, …) go in the experiment's own `.gitignore`.

### Collections

- Indefinite collections, such as hello-world, Project Euler or a whole book of exercises, are numbered `000000`, `000001`, `000002`, … instead of dated, so they always list first.
- Inside a collection, each entry gets its own folder with language subfolders, and the collection's README has a table of the entries.
- A single algorithm from a book chapter or paper is a normal dated experiment, not a collection.

## Index

- [000000—Multiple-language `Hello, world!`](000000-ONGOING-hello-world) · *Ada, C, Clojure, D, Forth, Go, Haskell, Julia, OCaml, R, Scheme, Swift*\
  Minimal program and run command per language.
- [000001—Project Euler](000001-ONGOING-project-euler)\
  Project Euler problems.
- [261111—SCPI over raw TCP sockets](261111-DONE-scpi-raw-socket) · *Python, Clojure*\
  SCPI to a Siglent scope over TCP 5025; read replies until LF.
- [261111—Simplest HTML templating](261111-DONE-simple-html-templating) · *TypeScript (Deno)*\
  Layout + nestable components via regex and placeholder replacement; self-nesting needs a real parser.
- [261111—Random-wait execution in Tcl](261111-DONE-tcl-random-wait) · *Tcl*\
  `after` only queues work; nothing runs until `vwait` starts the event loop.
- [261111—Client-side navigation without frameworks](261111-PLANNED-client-side-navigation) · *TypeScript*\
  Swap page content with `fetch` and the History API.
- [261111—SCPI Binary Waveform](261111-PLANNED-scpi-binary-waveform) · *Python, Clojure*\
  Download and plot a full waveform; parse the IEEE 488.2 binary block.
