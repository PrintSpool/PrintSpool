import time
import os, sys
from nanomsg import (
    PAIR,
    poll,
    Socket,
    NanoMsgAPIError,
    DONTWAIT
)

socket_address = 'ipc:///home/d1plo1d/git_repos/teg/packages/teg-linuxcnc/example_socket'

socket = Socket(PAIR)
socket.connect(socket_address)

while True:
    try:
        message = socket.recv(flags=DONTWAIT)
        print("Received request: %s" % message)
    except NanoMsgAPIError:
        pass
        # print("NADA")

    #  Do some 'work'
    time.sleep(0.1)

    #  Send reply back to client
    # socket.send(b"World")

socket.close()
