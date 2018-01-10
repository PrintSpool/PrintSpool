import move from '../utils/move'

const moveBy = (args, config) => {
  const moveArgs = {
    axes: args,
    relativeMovement: true,
  }
  return move(moveArgs, config)
}

export default moveBy
