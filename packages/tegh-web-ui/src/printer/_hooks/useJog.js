import useExecGCodes from './useExecGCodes'

const useJog = ({ printer, distance }) => (
  (axis, direction) => useExecGCodes(() => ({
    printerID: printer.id,
    gcodes: [
      { moveBy: { distances: { [axis]: direction * distance } } },
    ],
  }))
)


export default useJog
