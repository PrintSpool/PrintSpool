import socket

socket_address = './example_socket'

sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
sock.connect(socket_address)

sock.sendall("hello world")
