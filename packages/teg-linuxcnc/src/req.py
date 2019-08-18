import time
import os, sys
from nanomsg import (
    PAIR,
    poll,
    Socket,
    NanoMsgAPIError,
    DONTWAIT
)

socket = Socket(PAIR)

socket_address = 'ipc:///home/d1plo1d/git_repos/teg/packages/teg-linuxcnc/example_socket'

socket.bind(socket_address)
# s2.connect(socket_address)
# print(s2.recv())
# s2.close()

while True:
    print "SENDING??"
    try:
        socket.send(b'hello nanomsg', DONTWAIT)
        print "SENT!"
    except NanoMsgAPIError:
        print "Unable to send nanomsg. Will retry."
    try:
        message = socket.recv(flags=DONTWAIT)
        print("Received request: %s" % message)
    except NanoMsgAPIError:
        pass

    #  Do some 'work'
    time.sleep(1)

    #  Send reply back to client
    # socket.send(b"World")

socket.close()
