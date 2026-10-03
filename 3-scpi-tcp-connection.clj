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

(defn connect
  "Open a SCPI connection. Returns a map holding the socket and its streams."
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
    ;; I'm not sure if (loop) is idiomatic in Clojure, doesn't sound right,
    ;; am I getting scammed by this code example I got?
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
  (def scope (connect "192.168.0.10" 5025)) ; Setting my IP manually for testing
  (query scope "*IDN?") ; Get ID
  (send! scope "ASET") ; Auto set
  (close! scope))
