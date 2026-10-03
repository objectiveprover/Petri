import socket
import sys
import time

# Note: This file contains code that I got from the web so I could test
# the connection with my oscilloscope, it has the same function as the
# Clojure example in this same directory. I like that I don't need to
# know about the context of an external language like Java.

def SocketConnect(remote_ip, port):
    socketConnection = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        print("Connecting to socket")
        socketConnection.connect((remote_ip, port))
        socketConnection.settimeout(5) # Don't hang on failure, crash instead
        print(f"Connected: {socketConnection.getsockname()}")
    except socket.error:
        print(f"Failed to connect to {remote_ip}: {socket.error}")
        socketConnection.close()
        sys.exit();
    return socketConnection

def SocketQuery(socketConnection, cmd):
    socketConnection.sendall(cmd)
    reply = b''
    # Add data coming in to `reply`
    while not reply.endswith(b'\n'):
        chunk = socketConnection.recv(4096)
        if not chunk:
            raise ConnectionError('Scope closed the connection')
        reply += chunk
    return reply.strip()

def SocketClose(socketConnection):
    socketConnection.close()
    time.sleep(.300)

def main():
    remoteIP = "192.168.0.10" # The local address of my Siglent SDS 1202X-E
    port = 5025 # Raw TCP socket port for IEEE 488.2 communication

    # Connect
    socketConnection = SocketConnect(remoteIP, port)
    # Get the instrument ID
    print(str(SocketQuery(socketConnection, b'*IDN?\n')))
    # Get the Channel 1 vertical scale
    print(SocketQuery(socketConnection, b'C1:VDIV?\n'))
    # Get all data from Channel 1
    print(SocketQuery(socketConnection, b'C1:PAVA? ALL\n'))
    # Close and exit
    SocketClose(socketConnection)
    input('Press "Enter" to exit')

if __name__ == '__main__':
    proc = main()
