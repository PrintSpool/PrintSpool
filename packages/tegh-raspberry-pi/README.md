## tegh-raspberry-pi

Adds control of raspberry pi GPIO output pins to tegh.

## Configuration

development.config.js includes an example of how to configure tegh-raspberry-pi.

For documentation on which pin is which see:

https://elinux.org/RPi_Low-level_peripherals#Model_A.2B.2C_B.2B_and_B2

## Useage

Once a pin has been configured as an output in your config file and Tegh has been restarted you can set the pin's values in gcode using setGPIO:

`setGPIO {"pin": 4, "value": true}`

See examples directory for more example useage.
