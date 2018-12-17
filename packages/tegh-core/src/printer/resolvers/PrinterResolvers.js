import isIdle from '../../spool/selectors/isIdle'
import getComponents from '../../config/selectors/getComponents'
import getComponentsState from '../selectors/getComponentsState'
import getPluginModels from '../../config/selectors/getPluginModels'
import ComponentTypeEnum from '../../config/types/components/ComponentTypeEnum'

const PrinterResolvers = {
  Printer: {
    id: source => source.config.printer.id,
    name: source => getPluginModels(source.config).getIn(['tegh-core', 'name']),
    targetTemperaturesCountdown: source => getComponentsState(source).targetTemperaturesCountdown,
    activeExtruderID: source => getComponentsState(source).activeExtruderID,
    enabledMacros: source => source.macros.enabledMacros,
    error: source => source.status.error,

    components: (source, args) => {
      const id = args.componentID
      const components = getComponents(source.config)

      if (id != null) {
        const component = components.get(id)
        if (component == null) {
          throw new Error(`Component ID: ${id} does not exist`)
        }
        return [component]
      }
      return components
        .toList()
        .sortBy(c => (
          `${ComponentTypeEnum.indexOf(c.type)}${c.model.get('name')}`
        ))
    },

    plugins: (source, args) => {
      const { plugins } = source.config.printer

      if (args.package != null) {
        const plugin = plugins.find(p => p.package === args.package)
        if (plugin == null) {
          throw new Error(`Plugin package: ${args.package} does not exist`)
        }
        return [plugin]
      }

      return plugins
    },

    status: (source) => {
      if (!isIdle(source.spool)) return 'PRINTING'
      const { status } = source.status
      return status.substring(status.lastIndexOf('/') + 1)
    },

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
