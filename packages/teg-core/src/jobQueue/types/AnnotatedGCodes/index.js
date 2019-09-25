import { Record, List } from 'immutable'
import Ajv from 'ajv'

import normalizeGCodeLines from './normalizeGCodeLines'

const Annotation = Record({
  lineNumber: null,
  action: null,
})

const AnnotatedGCodesRecord = Record({
  commands: null,
  annotations: List(),
})

const AnnotatedGCodes = ({
  commands,
  // TODO: macros reducer
  // const macros = getMacrosByMachine({ plguins, combinatorConfig, machineConfig })
  macros,
  combinatorConfig,
  machineConfig,
}) => {
  let annotations = List()
  let ephemeralMachineConfig = machineConfig

  const normalized = normalizeGCodeLines(commands, (key, args, lineNumber) => {
    const macro = macros.getIn([machineConfig.id, key])

    if (macro == null) {
      throw new Error(`macro ${key} not found`)
    }

    const ajv = new Ajv({
      allErrors: true,
      coerceTypes: true,
    })

    const validateWithAJV = ajv.compile(macro.schema || {})
    const valid = validateWithAJV(args)

    if (!valid) {
      throw new Error(`Macro arguments error: ${JSON.stringify(validateWithAJV.errors)}`)
    }

    const {
      actions = [],
      commands: expandedCommands = [],
      ephemeralMachineConfig: nextEphemeralMachineConfig,
    } = macro.compile({
      args,
      machineConfig: ephemeralMachineConfig,
      combinatorConfig,
    })

    // ephemeral machine configs are used to transfer machine config changes from one macro to the next as if they
    // were actually playing out in real time. The ephemeral configs ultimately get discarded but they can be useful
    // in situations where one macro depends on the output of another (eg. setToolheadMaterial and toggleHeaters).
    ephemeralMachineConfig = nextEphemeralMachineConfig || ephemeralMachineConfig

    if (actions.forEach === null) {
      throw new Error(`Internal macro error: actions must be an array for macro: ${JSON.stringify(jsonGCode)}`)
    }

    if (expandedCommands.forEach === null) {
      throw new Error(`Internal macro error: commands must be an array for macro: ${JSON.stringify(jsonGCode)}`)
    }

    actions.forEach((action) => {
      const annotation = Annotation({
        lineNumber,
        action,
      })
      annotations = annotations.push(annotation)
    })

    return expandedCommands
  })

  return AnnotatedGCodesRecord({
    commands: normalized,
    annotations,
  })
}

export default AnnotatedGCodes
