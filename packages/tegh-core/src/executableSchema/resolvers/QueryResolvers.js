import getConfiguredDevices from '../../config/selectors/getConfiguredDevices'

const QueryResolvers = {
  Query: {
    /*
     * config
     */
    hosts: (source, args, { store }) => {
      const state = store.getState()

      if (args.hostID && args.hostID !== state.config.host.id) {
        return []
      }

      return [state.config.host]
    },
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
      const { collection, printerID, schemaFormKey } = args.input
      const state = store.getState()

      switch (collection) {
        case 'COMPONENT': {
          if (printerID !== state.config.printer.id) {
            throw new Error(`Printer ID: ${printerID} does not exist`)
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
    printers: (_source, args, { store }) => {
      const id = args.printerID
      const state = store.getState()
      if (id != null && id !== state.config.printer.id) {
        return []
      }
      return [state]
    },
  },
}

export default QueryResolvers
