# Tcl random wait

**Languages:** Tcl

## Goal

See how Tcl schedules delayed work with `after`, using a random wait of 2–5 seconds. The script runs for about 6 seconds because of the busy loop in step (4).

## Run

```sh
tclsh main.tcl
```

## Observations

- `after <ms> <script>` doesn't run anything in parallel. Tcl is single-threaded: `after` only queues the callback, and the event loop only runs once the script reaches `vwait`.
- So (3) printing before (2) isn't concurrency. The callback simply can't start before the rest of the script finishes. The busy loop in (4) proves it: (2) reports that ~6 seconds passed, even when it only asked for 2.
- Without `vwait` the script ends before the event loop ever runs, and the callback never fires. `vwait ::done` waits until the callback sets `::done`, which is tidier than `vwait forever` plus calling `exit` from the callback.
- `after` takes milliseconds, so the seconds are multiplied by 1000.
