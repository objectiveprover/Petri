#!/usr/bin/env tclsh

# `after` doesn't run anything in parallel. Tcl is single-threaded:
# `after` only queues the callback in the event loop, and the event loop
# doesn't run until the script hands it control with `vwait`.
# That's why (3) always prints before (2): the callback can't start
# until the rest of the script has finished.
#
# Step (4) proves it: it keeps the script busy for longer than the
# longest possible wait, and (2) still only prints after it, reporting
# that more time passed than it asked for.

# Generate a random number between the provided
# `min` and `max` range
proc randomInRange {min max} {
    set range [expr {$max - $min + 1}]
    return [expr {$min + int(rand() * $range)}]
}

# Called by the event loop once the wait is over.
# Setting `::done` releases the `vwait` at the end so the script can finish.
# The `n` parameter is just for knowing the order of the call
proc waitTest {n startedAt} {
    set elapsed [expr {([clock milliseconds] - $startedAt) / 1000.0}]
    chan puts "$n Wait finished after $elapsed seconds"
    chan puts "--------------------------------------------------"
    set ::done 1
}

# The `after` function expects milliseconds, and we want to use seconds
# so we need to multiply and divide by 1000 for convenience
set waitFor [expr {[randomInRange 2 5] * 1000}]
set startedAt [clock milliseconds]
chan puts "1. Waiting [expr {$waitFor / 1000}] seconds"
after $waitFor [list waitTest "2." $startedAt]
chan puts "3. This runs immediately after (1), before (2)"

# Block the only thread for 6 seconds, longer than any possible wait
chan puts "4. Keeping the script busy for 6 seconds"
set busyUntil [expr {[clock milliseconds] + 6000}]
while {[clock milliseconds] < $busyUntil} {}
chan puts "4. Busy loop finished, only now can the event loop run (2)"

# Hand control to the event loop until the callback sets `::done`
vwait ::done
