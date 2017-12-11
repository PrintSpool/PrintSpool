// import 'tegh-driver-serial-gcode'
import teghDaemon from 'tegh-daemon'

const argv = [null, null, './test_printer_id.yml']

const loadPlugin = (plugin) => require(plugin)

teghDaemon(argv, loadPlugin)
