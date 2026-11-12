# Hello world

## Goal

A first "it runs" check for each language I try.

## Run

| Language | Command (from the language folder) |
|----------|------------------------------------|
| Ada | `gnatmake main.adb && ./main` |
| C | `cc main.c -o main && ./main` |
| Clojure | `clojure -M main.clj` |
| D | `rdmd main.d` |
| Forth | `gforth main.fs -e bye` |
| Go | `go run main.go` |
| Haskell | `runghc main.hs` |
| Julia | `julia main.jl` |
| OCaml | `ocaml main.ml` |
| R | `Rscript main.R` |
| Scheme | `scheme --script main.ss` |
| Swift | `swift main.swift` |

## Notes

- Forth: `."` prints a string, but standard Forth only allows it inside a word definition (`: hello … ;`).
- R: `print()` adds a `[1]` index and quotes, `cat()` prints the text as is.
