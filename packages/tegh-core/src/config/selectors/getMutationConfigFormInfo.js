import getComponents from './getComponents'

const PLUGIN = 'PLUGIN'
const COMPONENT = 'COMPONENT'
const MATERIAL = 'MATERIAL'
const MACHINE = 'MACHINE'

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

  const getCollectionInfo = (collectionPath, finder) => {
    const collectionMap = state.config.getIn(collectionPath)

    const index = collectionMap.findIndex(c => (
      c.id === configFormID
    ))

    if (index === -1) {
      throw new Error(`config form ID does not exist: ${configFormID}`)
    }

    return {
      subject: collectionMap.get(index),
      configPath: [...collectionPath, index],
    }
  }

  if (
    [PLUGIN, COMPONENT, MACHINE].includes(collection)
    && printerID !== state.config.printer.id
  ) {
    throw new Error(`Printer ID: ${printerID} does not exist`)
  }

  switch (collection) {
    case PLUGIN: {
      const { subject, configPath } = getCollectionInfo(['printer', 'plugins'])

      return {
        subject,
        configPath,
        schemaFormPath: ['plugins', subject.package],
      }
    }
    case COMPONENT: {
      const { subject, configPath } = getCollectionInfo(['printer', 'components'])

      return {
        subject,
        configPath,
        schemaFormPath: ['components', subject.type],
      }
    }
    case MATERIAL: {
      const { subject, configPath } = getCollectionInfo(['materials'])

      return {
        subject,
        configPath,
        schemaFormPath: ['materials', subject.type],
      }
    }
    case MACHINE: {
      return {
        subject: state.config.printer,
        configPath: ['printer'],
        schemaFormPath: ['machine'],
        isMachine: true,
      }
    }
    default: {
      throw new Error(`Unsupported collection: ${collection}`)
    }
  }
}

export default getMutationConfigFormInfo
