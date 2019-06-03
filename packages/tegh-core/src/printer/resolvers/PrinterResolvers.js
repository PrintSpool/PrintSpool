import isIdle from '../../spool/selectors/isIdle'
import getComponents from '../../config/selectors/getComponents'
import getComponentsState from '../selectors/getComponentsState'
import getPluginModels from '../../config/selectors/getPluginModels'
import ComponentTypeEnum from '../../config/types/components/ComponentTypeEnum'
import getMachineConfigForm from '../../config/selectors/getMachineConfigForm'

const PrinterResolvers = {
  Printer: {
    id: source => source.config.printer.id,
    name: source => getPluginModels(source.config).getIn(['@tegh/core', 'name']),

    // targetTemperaturesCountdown: source => (
    //   getComponentsState(source).targetTemperaturesCountdown
    // ),

    activeExtruderID: source => getComponentsState(source).activeExtruderID,

    motorsEnabled: source => getComponentsState(source).motorsEnabled,

    enabledMacros: source => source.macros.enabledMacros,
    error: source => source.status.error,

    availablePackages: (source, args, { store }) => {
      const state = store.getState()
      const { availablePlugins } = state.pluginManager

      const installedPackages = state.config.printer.plugins.map(p => p.package)

      return Object.keys(availablePlugins).filter(packageName => (
        installedPackages.includes(packageName) === false
      ))
    },

    configForm: (source, args, { store }) => {
      const state = store.getState()

      const {
        model,
        modelVersion,
        schemaForm,
      } = getMachineConfigForm(state)

      return {
        id: source.config.printer.id,
        model,
        modelVersion,
        schemaForm,
      }
    },

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

    // logEntries: (source, args) => {
    //   let entries = source.log.get('logEntries')
    //   if (args.level != null) {
    //     entries = entries.filter(log => log.level === args.level)
    //   }
    //   if (args.sources != null) {
    //     entries = entries.filter(log => args.sources.includes(log.source))
    //   }
    //   if (args.limit != null) {
    //     entries = entries.slice(0, args.limit)
    //   }
    //   return entries.toArray()
    // },

    gcodeHistory: (source, args, { store }) => {
      const state = store.getState()
      const {
        fullHistory,
        historyExcludingPolling,
      } = state.get('@tegh/driver-serial-gcode').gcodeHistory

      let entries = fullHistory

      if (args.excludePolling === true) {
        entries = historyExcludingPolling
      }

      if (args.limit != null) {
        entries = entries.slice(0, args.limit)
      }

      return entries.toArray()
    },
    movementHistory: (source, args, { store }) => {
      const state = store.getState()
      return getComponentsState(state).movementHistory
        .toArray()
    },
  },
}

export default PrinterResolvers
