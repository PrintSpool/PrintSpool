import move from '../util/move'

const moveTo = (args, config) => {
  const moveArgs = {
    axes: args,
    allowExtruderAxes: false,
    relativeMovement: false,
  }
  return move(moveArgs, config)
}

export default moveTo
