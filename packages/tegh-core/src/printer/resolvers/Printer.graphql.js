import isIdle from '../../spool/selectors/isIdle'
import getComponentsState from '../selectors/getComponentsState'

const PrinterGraphQL = {
  id: source => source.config.printer.printerID,
  name: source => source.config.printer.name,
  heaters: source => getComponentsState(source).heaters.toList(),
  targetTemperaturesCountdown: source => getComponentsState(source).targetTemperaturesCountdown,
  activeExtruderID: source => getComponentsState(source).activeExtruderID,
  fans: source => getComponentsState(source).fans.toList(),
  status: (source) => {
    if (!isIdle(source.spool)) return 'PRINTING'
    const { status } = source.status
    return status.substring(status.lastIndexOf('/') + 1)
  },
  error: source => source.status.error,
  macroDefinitions: source => source.macros.keys(),
  logEntries: (source, args) => {
    let entries = source.log.get('entries')
    if (args.level != null) {
      entries = entries.filter(log => log.level === args.level)
    }
    if (args.source != null) {
      entries = entries.filter(log => log.source === args.source)
    }
    return entries.toArray()
  },
}

export default PrinterGraphQL
