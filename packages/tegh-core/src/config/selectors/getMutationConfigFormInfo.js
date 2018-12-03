import getComponents from './getComponents'

const PRINTER = 'PRINTER'
const MATERIAL = 'MATERIAL'

/*
 * This selector is different from other selectors in that it is used to
 * select from mutation args and the state whereas other selectors are
 * purely based on the state.
 */
const getMutationConfigFormInfo = ({ state, args }) => {
  const {
    routingMode,
    printerID,
    // TODO: host config forms
    // hostID,
    configFormID,
  } = args.input

  switch (routingMode) {
    case PRINTER: {
      const components = getComponents(state.config)
      const { plugins } = state.config.printer

      if (printerID !== state.config.printer.id) {
        throw new Error(`Printer ID: ${printerID} does not exist`)
      }

      const isComponent = components.get(configFormID) != null

      const subject = (
        components.get(configFormID)
        || plugins.find(p => p.id === configFormID)
      )

      const collectionKey = isComponent ? 'components' : 'plugins'
      const collectionPath = ['printer', collectionKey]

      return {
        subject,
        collectionPath,
        schemaKey: subject.type || subject.package,
      }
    }
    case MATERIAL: {
      const subject = state.config.materials.find(m => m.id === configFormID)
      return {
        subject,
        collectionPath: ['materials'],
        schemaKey: subject.type,
      }
    }
    // case HOST: {
    //
    // }
    default: {
      throw new Error(`Unsupported routingMode: ${routingMode}`)
    }
  }
}

export default getMutationConfigFormInfo
