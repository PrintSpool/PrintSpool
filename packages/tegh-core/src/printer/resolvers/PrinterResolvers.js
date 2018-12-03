import isIdle from '../../spool/selectors/isIdle'
import getComponents from '../../config/selectors/getComponents'
import getComponentsState from '../selectors/getComponentsState'
import getPluginModels from '../../config/selectors/getPluginModels'
import ComponentTypeEnum from '../../config/types/components/ComponentTypeEnum'

const PrinterResolvers = {
  Printer: {
    id: source => source.config.printer.id,
    name: source => getPluginModels(source.config).getIn(['tegh-core', 'name']),
    components: source => (
      getComponents(source.config)
        .toList()
        .sortBy(c => (
          `${ComponentTypeEnum.indexOf(c.type)}${c.model.get('name')}`
        ))
    ),
    targetTemperaturesCountdown: source => getComponentsState(source).targetTemperaturesCountdown,
    activeExtruderID: source => getComponentsState(source).activeExtruderID,
    status: (source) => {
      if (!isIdle(source.spool)) return 'PRINTING'
      const { status } = source.status
      return status.substring(status.lastIndexOf('/') + 1)
    },
    error: source => source.status.error,
    macroDefinitions: source => source.macros.macros.keys(),
    logEntries: (source, args) => {
      let entries = source.log.get('logEntries')
      if (args.level != null) {
        entries = entries.filter(log => log.level === args.level)
      }
      if (args.source != null) {
        entries = entries.filter(log => log.source === args.source)
      }
      return entries.toArray()
    },
  },
}

export default PrinterResolvers
