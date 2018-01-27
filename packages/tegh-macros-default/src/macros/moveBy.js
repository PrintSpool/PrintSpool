import move from '../utils/move'

const moveBy = (args, config) => {
  const moveArgs = {
    axes: args,
    allowExtruderAxes: true,
    relativeMovement: true,
  }
  return move(moveArgs, config)
}

export default moveBy
