import socket

socket_address = './uds_socket'

sock = socket.socket(socket.AF_UNIX, socket.SOCK_DGRAM)
sock.bind('/tmp/somesocket')
