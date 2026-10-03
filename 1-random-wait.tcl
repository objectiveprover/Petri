#!/usr/bin/env tclsh

# It looks like execution is asynchronous, because the program
# prints (3) while (2) finishes.
# Also `vwait forever` at the end is needed to keep the process running
# until `exit` is called, otherwise the program will exit
# before the `after` instruction has finished.

# Generate a random number between the provided
# `min` and `max` range
proc randomInRange {min max} {
    set range [expr {$max - $min + 1}]
    return [expr {$min + int(rand() * $range)}]
}

# We need to call `exit` manually because we used `vwait forever`
# to keep the process running while `after` finishes.
# The `n` parameter is just for knowing the order of the call
proc waitTest {n} {
    chan puts "$n Wait finished"
    chan puts "--------------------------------------------------"
    exit
}

# The `after` function expects milliseconds, and we want to use seconds
# so we need to multiply and divide by 1000 for convenience
set waitFor [expr {[randomInRange 2 5] * 1000}]
chan puts "1. Waiting [expr {$waitFor / 1000}] seconds"
after $waitFor [list waitTest "2."]
chan puts "3. This immediately after (1) but before (2)"

# Keep the program running forever until we call `exit`,
# We need this so commands like `after` can finish
vwait forever
