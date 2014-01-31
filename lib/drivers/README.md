# Tegh Daemon Drivers

A driver in Tegh Daemon is a coffee script class who's instances each provide a low level gcode interface with a 3D printer. Each driver has it's own subfolder with the same name as the driver contained in it.

## The Driver API

All driver must implement the following functions:

### Functions

* **driver.reset()** - Resets the printer. This can be a hard or soft reset but if it's soft it must be reliable.
* **driver.kill()** - Stops the print driver and cleans up any event listeners.
* **driver.sendNow(gcode)** - Sends a gcode to the printer as soon as any previous send now gcodes have been executed.
* **driver.print(printJob)** - Sends all the gcode lines in a print job (see print_job.coffee). These gcodes are lower priority then sendNow gcodes, meaning that any queued sendNow commands will be executed before queued print job gcodes.
* **driver.isPrinting()** - returns true if the driver is printing a printJob
* **driver.isClearToSend()** - returns true if the driver has initialized and isn't waiting on any form of acknowledgement of previous gcodes.
* **driver.startPolling()** - starts polling the printer's temperature data at pollingInterval.

### Variables

* **verbose**
* **waitForHeaders**
* **pollingInterval** - the rate at which to poll for temeprature data.

### Events

* **ready** - Emitted when the printer initializes (either because of an initial connection or a completed reset)
* **change** - Emitted when any attribute of the printer changes
* **printer\_error** - Emitted when the printer encounters an error
* **print\_complete** - Emitted when the printer is done a print job
* **print\_job\_line\_sent** - Emitted on each line sent that is part of the current print job.

## Implementation Example

See drivers/null\_driver/null\_driver.coffee
