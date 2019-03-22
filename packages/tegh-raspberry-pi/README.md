## tegh-raspberry-pi

Adds control of raspberry pi GPIO output pins to tegh.

## Configuration

development.config.js includes an example of how to configure tegh-raspberry-pi.

For documentation on which pin is which see:

https://elinux.org/RPi_Low-level_peripherals#Model_A.2B.2C_B.2B_and_B2

## Useage

Once a pin has been configured as an output in your config file and Tegh has been restarted you can set the pin's values in gcode using setGPIO:

`setGPIO {"pin": 7, "value": true}`

See examples directory for more example useage.

## Pin Numbers

Pins numbers start at the top left of the raspberry pi's pins and go left to right and top to bottom. So pin 1 is 3.3v, pin 2 is 5v and pin 3 is GPIO2 / SDA1 - the first useable pin for Tegh output.

<img src="./docs/Pi-GPIO-header.png" />

See also: [Raspberry Pi Low-level peripherals](https://elinux.org/RPi_Low-level_peripherals#Model_A.2B.2C_B.2B_and_B2)
