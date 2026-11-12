;; Simplest TUI in Chez Scheme, no libraries: a list of strings, move with
;; Up/Down (or j/k), Enter prints the selected string and exits, q quits.
;;
;; Two tricks are needed:
;;   1. `stty -icanon -echo` so keys arrive one at a time and aren't echoed.
;;   2. ANSI escape codes to clear the screen, highlight a line, etc.
;;
;; The UI is drawn on stderr so stdout only gets the chosen string, which
;; makes it composable: echo "You picked: $(scheme --script main.ss)"

(define items
  '("Hello, world!" "Hola, mundo!" "Bonjour, le monde !" "Hallo, Welt!" "Ciao, mondo!"))

(define ui (current-error-port))

(define (put . strs)
  (for-each (lambda (s) (display s ui)) strs))

;; ESC is written \x1b; in Chez strings (R6RS hex escape ends with ';').
(define (draw selected)
  (put "\x1b;[H\x1b;[2J")                           ; cursor home + clear screen
  (put "Pick one: Up/Down or j/k, Enter selects, q quits\n\n")
  (let loop ([xs items] [i 0])
    (unless (null? xs)
      (put (if (= i selected) "\x1b;[7m> " "  ")    ; 7m = reverse video
           (car xs)
           "\x1b;[0m\n")                            ; 0m = reset attributes
      (loop (cdr xs) (+ i 1))))
  (flush-output-port ui))

;; Arrow keys send three characters: ESC [ A (up) and ESC [ B (down).
(define (read-key)
  (let ([c (read-char)])
    (cond
      [(eof-object? c) 'quit]
      [(char=? c #\x1b)
       (read-char)                                  ; skip the '['
       (case (read-char) [(#\A) 'up] [(#\B) 'down] [else 'other])]
      [(char=? c #\k) 'up]
      [(char=? c #\j) 'down]
      [(char=? c #\newline) 'enter]
      [(char=? c #\q) 'quit]
      [else 'other])))

(define (choose)
  (let loop ([sel 0])
    (draw sel)
    (case (read-key)
      [(up)    (loop (max 0 (- sel 1)))]
      [(down)  (loop (min (- (length items) 1) (+ sel 1)))]
      [(enter) (list-ref items sel)]
      [(quit)  #f]
      [else    (loop sel)])))

;; ?1049h/l = switch to/from the alternate screen (like vim or less),
;; ?25l/h   = hide/show the cursor.
(define (enter-tui)
  (system "stty -icanon -echo")
  (put "\x1b;[?1049h\x1b;[?25l"))

(define (leave-tui)
  (put "\x1b;[?25h\x1b;[?1049l")
  (flush-output-port ui)
  (system "stty icanon echo"))

;; Ctrl-C still works (ISIG is left on), so put the terminal back first.
(keyboard-interrupt-handler (lambda () (leave-tui) (exit 130)))

(let ([choice (dynamic-wind enter-tui choose leave-tui)])
  (when choice
    (display choice)
    (newline))
  (exit (if choice 0 1)))
