# Chez Scheme TUI menu

**Languages:** Scheme (Chez)

## Goal

A "hello world" for TUIs in Chez Scheme, without any libraries: show a list of strings, move with the arrow keys, and print the one selected when pressing Enter.

## Run

```sh
scheme --script main.ss

# The UI is drawn on stderr, so the choice can be captured:
echo "You picked: $(scheme --script main.ss)"
```

Keys: Up/Down or `j`/`k` move, Enter selects, `q` or Ctrl-C quits without printing anything (exit status 1 or 130).

## Findings

- A minimal TUI needs only two things. `stty -icanon -echo` (run through `system`) delivers each key as soon as it's pressed, without echoing it. ANSI escape codes handle the drawing: clear the screen, use reverse video for the selected line, switch to the alternate screen, and hide the cursor.
- In Chez strings, ESC is written `\x1b;`. The R6RS hex escape ends with `;`, not at a fixed length.
- Arrow keys arrive as three characters, `ESC [ A` and `ESC [ B`. Because of this, a bare Esc can't easily be used as "quit": the program would have to wait to see whether more characters follow. `q` avoids that.
- Without `-icanon` and `-echo`, the terminal stays in a broken state if the program dies. `dynamic-wind` restores it on normal exit and on errors, and `keyboard-interrupt-handler` restores it on Ctrl-C.
