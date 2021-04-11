## Pi Benchmarks for 3D Printer Servers

These benchmarks compare Teg and Octoprint's performance critical print loops.

### How it works

The gcode_stress_test benchmark looks at latencies between sending GCode responses to the print server (eg. `ok`) and receiving the next GCode command (eg. `G1 X10 F3000`).

It does this by adding a virtual serial device to the pi. The virtual serial device will connect to your print server like a normal printer and respond similarly to Marlin but with minimal latency and no heat up time.

Once the virtual serial device sees a special marker GCode denoting the start of the print it uses criterion to run a statistical analysis of the print server's response timing.

Once the statistical analysis is complete the virtual serial device will disconnect. After the last print server is tested an html report is generated.

### Running the Benchmark

`../../scripts/pi-benchmark` will install Teg on the raspberry pi and start the benchmarks.

**Note:** Once the benchmark is installed some user interaction is required. Please follow the instructinos on the screen.
