## Linking dependencies

You have two options for setting up the integration test dependencies

### Option A
Install dependencies normally via `yarn`

node modules will need to be deleted and re-installed using `yarn` every time a change is made to `tegh-daemon` or `tegh-driver-serial-gcode`.

### Option B
`yarn link` tegh-daemon and tegh-driver-serial-gcode to the integration test as well as tegh-serial-middleware to tegh-driver-serial-gcode.

This method is more complicated to setup but gives the advantage of not having to delete and reinstall node modules after each change.

See https://yarnpkg.com/lang/en/docs/cli/link/
