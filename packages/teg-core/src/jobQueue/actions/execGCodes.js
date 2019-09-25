import AnnotatedGCodes from '../types/AnnotatedGCodes'
import spoolTask from './spoolTask'

const execGCodes = ({
  machineID,
  commands: inputCommands,
  macros,
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
    onComplete,
    onError,
  })
}

export default execGCodes
