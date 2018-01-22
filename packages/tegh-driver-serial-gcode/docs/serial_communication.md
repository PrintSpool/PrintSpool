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
2. The USB serial connection dropped the newline character sent from the host (and may have dropped more of the message).
3. The USB serial connection dropped the newline character in the response from the printer (and may have dropped more of the message).

All of the situations in which a response is not sent appear identical to the host software.

### Solution

In these scenarios the host will wait for a response and if one is not received within it's timeout (configured by the user) it will send M105 (report temperature) to "tickle" the firmware. **Important**: the M105 is not sent with a line number so that if it is lost in transmission it does not effect the line numbers of either the host or the firmware. The firmware may respond in one of four ways to this "tickling" which will indicate to the host software how to proceed:

* **Silence** - The firmware buffer may either be full or the M105 was also lost to a communication failure. The host software will repeat the process of waiting and sending M105 a number of times before setting the printer's status to 'error'.
* **Resend** - The firmware sends a 'resend' for the original lost line. This indicates that the firmware did not receive the newline character (See scenario \#2 above). Specifically the M105 command was interpreted by the firmware as being appended to the previous line and this caused a checksum mismatch in turn causing the resend request. The host software will resend the line and then resume normal de-spooling. Eg:
  * Host sends
    `N1 G1 X10 *123\n`
    `M105\n`
  * Firmware receives
    `N1 G1 X10 *123M105\n`
  * Firmware sends
    `Error:checksum mismatch, Last Line: 0\n`
    `Resend: 1\n`
  * Host software resend line 1. Receives ok. Then continues de-spooling.
* **Okok** - The host receives 'okok', 'kok' or 'ok'. This indicates that the printer had received the previous gcode line successfully and that it was the response from the firmware that was dropped (See scenario \#3 above). Eg:
  * Host sends
    `N1 G1 X10 *123\n`
    `M105\n`
  * Firmware receives
    `N1 G1 X10 *123\n`
  * Firmware sends
    `ok\n`
  * Firmware receives
    `M105\n`
  * Firmware sends
    `ok\n`
  * Host software receives two 'ok's on one line. Treats it as an 'ok' and continues de-spooling:
    `okok\n`
* **Error** - This is unrelated to the corrupted serial communication and should be treated as any other error from the firmware.
