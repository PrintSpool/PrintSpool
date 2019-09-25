import {
  ComponentTypeEnum,
  setToolheadMaterials,
} from '@tegapp/core'

const { TOOLHEAD } = ComponentTypeEnum

// example usage: { setMaterials: { toolheads: { e0: exampleMaterialID } } }
const compileSetMaterials = ({
  args: { toolheads },
  machineConfig,
  combinatorConfig,
}) => {
  let ephemeralMachineConfig = machineConfig

  const changes = Object.entries(toolheads).map(([address, materialID]) => {
    const [index, component] = machineConfig.components.findEntry(c => (
      c.model.get('address') === address
    ))

    const material = combinatorConfig.materials.find(m => m.id === materialID)

    if (component == null || component.type !== TOOLHEAD) {
      throw new Error(`Toolhead (${address}) does not exist`)
    }

    if (material == null) {
      throw new Error(`Material (${materialID}) does not exist`)
    }

    ephemeralMachineConfig = ephemeralMachineConfig.setIn(
      ['components', index, 'model', 'materialID'],
      materialID,
    )

    return {
      materialID,
      toolheadID: component.id,
    }
  })

  const action = setToolheadMaterials({
    changes,
    machineID: machineConfig.id,
  })

  return {
    actions: [action],
    ephemeralMachineConfig,
  }
}

const setMaterialsMacro = {
  key: 'setMaterials',
  schema: {
    type: 'object',
    required: ['toolheads'],
    properties: {
      toolheads: {
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
      },
    },
  },
  compile: compileSetMaterials,
}

export default setMaterialsMacro
