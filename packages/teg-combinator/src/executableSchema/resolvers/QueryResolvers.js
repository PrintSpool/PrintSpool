import getConfiguredDevices from '../../config/selectors/getConfiguredDevices'
import getSchemaForms from '../../pluginManager/selectors/getSchemaForms'

import packageJSON from '../../../package.json'

const QueryResolvers = {
  Query: {
    tegVersion: () => packageJSON.version,
    hasPendingUpdates: (source, args, { store }) => {
      const state = store.getState()

      return state.updates.hasPendingUpdates
    },
    /*
     * config
     */
    isConfigured: (source, args, { store }) => {
      const state = store.getState()

      return state.config.printer.isConfigured
    },
    // hosts: (source, args, { store }) => {
    //   const state = store.getState()
    //
    //   if (args.hostID && args.hostID !== state.config.host.id) {
    //     return []
    //   }
    //
    //   return [state.config.host]
    // },
    materials: (source, args, { store }) => {
      const state = store.getState()

      if (args.materialID != null) {
        const materials = state.config.materials.find(c => (
          c.id === args.materialID
        ))
        if (materials == null) return []
        return [materials]
      }
      return state.config.materials
    },
    schemaForm: (source, args, { store }) => {
      const { collection, machineID, schemaFormKey } = args.input
      const state = store.getState()

      switch (collection) {
        case 'MACHINE': {
          /*
           * TODO: make use of the DAT URL to generate
           * the machine schema form.
           */
          return state.schemaForms.get('machine')
        }
        case 'COMPONENT': {
          if (machineID !== state.config.printer.id) {
            throw new Error(`Printer ID: ${machineID} does not exist`)
          }
          const schemaForm = state.schemaForms.getIn(
            ['components', schemaFormKey],
          )
          return schemaForm
        }
        case 'MATERIAL': {
          const schemaForm = state.schemaForms.getIn(
            ['materials', schemaFormKey],
          )
          return schemaForm
        }
        case 'PLUGIN': {
          if (machineID !== state.config.printer.id) {
            throw new Error(`Printer ID: ${machineID} does not exist`)
          }

          const { availablePlugins } = state.pluginManager
          const schemaForms = getSchemaForms.resultFunc(
            Object.values(availablePlugins),
          )

          const schemaForm = schemaForms.getIn(
            ['plugins', schemaFormKey],
          )

          if (schemaForm == null) {
            throw new Error(`Plugin not found: ${schemaFormKey}`)
          }

          return schemaForm
        }
        default: {
          throw new Error(`Unsupported collection: ${collection}`)
        }
      }
    },
    /*
     * devices
     */
    devices: (_source, args, { store }) => {
      const state = store.getState()

      const connectedDevices = state.devices.byID
      // replace each configured device with it's connected equivalent if
      // it is connected.
      const configuredDevices = getConfiguredDevices(state.config)
        .map(device => (
          connectedDevices.find(d2 => d2.id === device.id) || device
        ))

      // remove duplicate devices
      const allDevices = configuredDevices.concat(connectedDevices.toList())
        .toOrderedSet()
        .toList()
        .filter(device => device.simulated === false)

      return allDevices
    },
    /*
     * jobQueue
     */
    jobQueue: (_source, args, { store }) => (
      store.getState()
    ),
    /*
     * printer
     */
    machines: (_source, args, { store }) => {
      const id = args.machineID
      const state = store.getState()
      if (id != null && id !== state.config.printer.id) {
        return []
      }
      return [state]
    },
  },
}

export default QueryResolvers
