import move from '../utils/move'

const moveTo = (args, config) => {
  const moveArgs = {
    axes: args,
    relativeMovement: false,
  }
  return move(moveArgs, config)
}

export default moveTo
