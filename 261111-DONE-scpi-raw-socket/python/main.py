import socket
import sys

# Note: This file contains code that I got from the web so I could test
# the connection with my oscilloscope, it has the same function as the
# Clojure example in ../clojure. I like that I don't need to know about
# the context of an external language like Java.

def socket_connect(remote_ip, port):
    print("Connecting to socket")
    try:
        # The timeout covers the connection attempt and every later read,
        # so an unreachable or silent scope fails instead of hanging
        connection = socket.create_connection((remote_ip, port), timeout=5)
    except OSError as error:
        print(f"Failed to connect to {remote_ip}:{port}: {error}")
        sys.exit(1)
    print(f"Connected: {connection.getsockname()}")
    return connection

def socket_query(connection, command):
    connection.sendall(command.encode('ascii') + b'\n')
    reply = b''
    # Add data coming in to `reply` until the line feed that ends it.
    # This only works for text replies, binary waveform data can contain
    # line feeds anywhere.
    while not reply.endswith(b'\n'):
        chunk = connection.recv(4096)
        if not chunk:
            raise ConnectionError('Scope closed the connection')
        reply += chunk
    return reply.decode('ascii').strip()

def main():
    # The local address of my Siglent SDS 1202X-E, unless another one is given
    remote_ip = sys.argv[1] if len(sys.argv) > 1 else "192.168.0.10"
    port = 5025 # Raw TCP socket port for IEEE 488.2 communication

    # The connection is closed when the block ends, even after an error
    with socket_connect(remote_ip, port) as connection:
        # Get the instrument ID
        print(socket_query(connection, '*IDN?'))
        # Get the Channel 1 vertical scale
        print(socket_query(connection, 'C1:VDIV?'))
        # Get all measurements from Channel 1
        print(socket_query(connection, 'C1:PAVA? ALL'))

    input('Press "Enter" to exit')

if __name__ == '__main__':
    main()
