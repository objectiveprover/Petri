;; Note: This file contains code that I got from the web so I could test
;; the connection with my oscilloscope without getting into the details
;; of the Java parts of Clojure, specifically the java.net module which I
;; still need to look into to completely understand what is going on.

(ns scpi
  "Raw-socket SCPI control for my Siglent SDS1202X-E oscilloscope."
  (:require [clojure.string :as str])
  (:import [java.net Socket InetSocketAddress]
           [java.io InputStream OutputStream BufferedInputStream
                    ByteArrayOutputStream]))

;; ---------------------------------------------------------------------------
;; Connection and main functions

(def default-port
  "Raw TCP socket port for SCPI / IEEE 488.2 communication."
  5025)

(defn connect
  "Open a SCPI connection. Returns a map holding the socket and its streams.
  The port defaults to `default-port`."
  ([host] (connect host default-port))
  ([host port]
   (let [sock (doto (Socket.)
                (.connect (InetSocketAddress. ^String host (int port)) 3000)
                (.setSoTimeout 5000))]
     {:socket sock
      :in     (BufferedInputStream. (.getInputStream sock))
      :out    (.getOutputStream sock)})))

(defn close! [{:keys [^Socket socket]}]
  (.close socket))

(defn send!
  "Send a command and return nil. For commands that don't produce a reply."
  [{:keys [^OutputStream out]} command]
  (doto out
    (.write (.getBytes (str command "\n") "US-ASCII"))
    (.flush))
  nil)

(defn read-until-lf
  "Read bytes up to LF, returning a string."
  [^InputStream in]
  (let [buf (ByteArrayOutputStream.)]
    ;; loop/recur is the idiomatic way to write a stateful loop like this,
    ;; it compiles to a plain loop without growing the stack.
    (loop []
      (let [b (.read in)]
        (cond
          (neg? b) (throw (ex-info "Scope closed the connection" {}))
          (= b 10) (str/trim (.toString buf "US-ASCII"))
          :else    (do (.write buf b) (recur)))))))

(defn query
  "Send a query and return the reply as a string."
  [connection command]
  (send! connection command)
  (read-until-lf (:in connection)))

;; ---------------------------------------------------------------------------
;; Test area
;;
;; I can just evaluate these things interactively in the Clojure REPL

(comment
  (def scope (connect "192.168.0.10")) ; Setting my IP manually for testing
  (query scope "*IDN?") ; Get ID
  (send! scope "ASET") ; Auto set
  (close! scope))
