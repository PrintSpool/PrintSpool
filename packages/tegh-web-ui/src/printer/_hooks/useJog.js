import useExecGCodes from './useExecGCodes'

const useJog = ({ machine, distance }) => (
  (axis, direction) => useExecGCodes(() => ({
    machineID: machine.id,
    gcodes: [
      { moveBy: { distances: { [axis]: direction * distance } } },
    ],
  }))
)


export default useJog
