import useExecGCodes from './useExecGCodes'

const useJog = ({ printer, distance }) => (
  (axis, direction) => useExecGCodes(() => ({
    printerID: printer.id,
    gcodes: [
      { moveBy: { distance: { [axis]: direction * distance } } },
    ],
  }))
)


export default useJog
