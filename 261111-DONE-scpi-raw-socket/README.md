# SCPI over a raw TCP socket

**Languages:** Python, Clojure

## Goal

Talk to my Siglent SDS1202X-E oscilloscope with SCPI / IEEE 488.2 commands over a raw TCP socket (port 5025)

> **Disclaimer:** Both versions are based on code I found on the web. I used them to test the connection, not to show how it should be done.

My scope's address defaults to `192.168.0.10`, and the port to `5025`.

## Run

```sh
# Python: queries *IDN?, C1:VDIV? and C1:PAVA? ALL, then closes.
# The scope's IP address is optional
python3 python/main.py [ip]

# Clojure: start a REPL, load the file, then evaluate the forms in the
# (comment ...) block one at a time
cd clojure && clj
user=> (load-file "scpi.clj")
user=> (in-ns 'scpi)
scpi=> (def scope (connect "192.168.0.10"))
scpi=> (query scope "*IDN?")
```
