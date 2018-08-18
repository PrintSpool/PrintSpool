import move from '../util/move'

const moveTo = (args, state) => {
  const moveArgs = {
    axes: args,
    allowExtruderAxes: false,
    relativeMovement: false,
  }
  return move(moveArgs, state)
}

export default moveTo
