# Serial Communication

USB serial connections drop and modify (corrupt) bytes sent to and received from the printer.


## Scenarios where the printer **would** send a response to a GCode:

1. The USB serial connection dropped bytes from the gcode line sent from the host but sent the newline character, the correct line number and checksum.
  * Firmware: sends a resend request for the line number
  * Host: errors if the requested line number is not the sent line number, otherwise resends the gcode line
2. Same as \#1 except with an **incorrect line number**
  * Firmware: sends an error
  * Host: shuts down. **TODO:** could this be handled better by recognizing incorrect line number errors and resending the previous line number?
3. The USB serial connection dropped bytes from the response sent from the printer, rendering an invalid response:
  * Host: logs a parser error
  * Host: if the corrupted response was an "ok" the Host will react as if the response was dropped entirely (see: Scenarios where the printer would not send a response)

## Scenarios where the printer **would not** send a response to a GCode:

1. The firmware's gcode buffer is full so the printer is not responding as flow control.
3. The USB serial connection dropped the newline character sent from the host (and may have dropped more of the message).
5. The USB serial connection dropped the newline character in the response from the printer (and may have dropped more of the message).

All of the situations in which a response is not sent appear identical to the host software.

In these scenarios the host will wait for a response and if one is not received within it's timeout (configured by the user) it will resend the line. It will repeat this process N times as configured by the user before logging an error and setting the printer status to `"error"`.

### If the host receives a response after resending the line

1. If the response is an error denoting that the line was already received the host will send `M999 S` to clear the error and continue the print.
2. If an "ok" is received in response to the resent line or `M999 S` the host will resume normal despooling.
