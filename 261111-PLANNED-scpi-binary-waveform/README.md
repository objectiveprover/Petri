# SCPI binary waveform

**Languages:** Python, Clojure

## Goal

Download a full waveform from the Siglent SDS1202X-E with `C1:WF? DAT2` and plot it. Builds on [261111-DONE-scpi-raw-socket](../261111-DONE-scpi-raw-socket).

The reply is binary data, which can contain line feeds anywhere, so reading until `\n` no longer works. It needs:

- Parsing the IEEE 488.2 definite-length block header (`#9000001400` and similar) to know how many bytes to read.
- Converting the raw samples to volts using the vertical scale (`C1:VDIV?`) and offset (`C1:OFST?`).
- Converting the sample index to time using the timebase and sample rate.
