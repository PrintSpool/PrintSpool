import { useMutation } from 'react-apollo-hooks'
import { EXEC_GCODES } from './useExecGCodes'

const useJog = ({ machine, distance }) => {
  const [execGCodes] = useMutation(EXEC_GCODES)

  return (axis, direction) => () => execGCodes({
    variables: {
      input: {
        machineID: machine.id,
        gcodes: [
          { moveBy: { distances: { [axis]: direction * distance } } },
        ],
      },
    },
  })
}

export default useJog
