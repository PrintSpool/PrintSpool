import move from '../util/move'

const moveBy = (args, state) => {
  const moveArgs = {
    axes: args,
    allowExtruderAxes: true,
    relativeMovement: true,
  }
  return move(moveArgs, state)
}

export default moveBy
