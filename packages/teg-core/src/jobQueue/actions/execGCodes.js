import AnnotatedGCodes from '../types/AnnotatedGCodes'
import spoolTask from './spoolTask'

const execGCodes = ({
  machineID,
  commands: inputCommands,
  macros,
  machineOverride,
  combinatorConfig,
  onComplete,
  onError,
}) => {
  const machineConfig = combinatorConfig.machines.get(machineID)

  const { annotations, commands } = AnnotatedGCodes({
    commands: inputCommands,
    macros,
    combinatorConfig,
    machineConfig,
  })
  // console.log({ inputCommands, commands})

  return spoolTask({
    machineID,
    name: '[execGCodes]',
    commands,
    annotations,
    macros,
    machineOverride,
    onComplete,
    onError,
  })
}

export default execGCodes
