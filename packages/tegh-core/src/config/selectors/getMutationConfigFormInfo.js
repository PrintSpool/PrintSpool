import getComponents from './getComponents'

const PLUGIN = 'PLUGIN'
const COMPONENT = 'COMPONENT'
const MATERIAL = 'MATERIAL'

/*
 * This selector is different from other selectors in that it is used to
 * select from mutation args and the state whereas other selectors are
 * purely based on the state.
 */
const getMutationConfigFormInfo = ({ state, args }) => {
  const {
    collection,
    printerID,
    // TODO: host config forms
    // hostID,
    configFormID,
  } = args.input

  switch (collection) {
    case PLUGIN:
    case COMPONENT: {
      if (printerID !== state.config.printer.id) {
        throw new Error(`Printer ID: ${printerID} does not exist`)
      }

      if (collection === PLUGIN) {
        const { plugins } = state.config.printer
        const subject = plugins.find(p => p.id === configFormID)

        return {
          subject,
          collectionPath: ['printer', 'plugins'],
          schemaFormKey: subject.package,
        }
      }

      const subject = getComponents(state.config).get(configFormID)

      return {
        subject,
        collectionPath: ['printer', 'components'],
        schemaFormKey: subject.type,
      }
    }
    case MATERIAL: {
      const subject = state.config.materials.find(m => m.id === configFormID)
      return {
        subject,
        collectionPath: ['materials'],
        schemaFormKey: subject.type,
      }
    }
    // case HOST: {
    //
    // }
    default: {
      throw new Error(`Unsupported collection: ${collection}`)
    }
  }
}

export default getMutationConfigFormInfo
