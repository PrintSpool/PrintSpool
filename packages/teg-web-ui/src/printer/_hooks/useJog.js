import { useExecGCodes2 } from './useExecGCodes'

const useJog = ({ machine, distance }) => {
  const jog = useExecGCodes2((axis, direction) => ({
    machineID: machine.id,
    gcodes: [
      { moveBy: { distances: { [axis]: direction * distance }, useVisualAxesTransform: true } },
    ],
  }), [])

  return (axis, direction) => () => jog.run(axis, direction)
}

export default useJog
