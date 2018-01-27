import withCreateTask from './withCreateTask'

const jog = ({ createTask }) => (axis, direction, distance) => () => {
  const multiplier = (() => {
    switch (direction) {
      case '+': return 1
      case '-': return -1
      default: throw new Error(`invalid direction ${direction}`)
    }
  })()
  createTask({macro: 'moveBy', args: {[axis]: distance * multiplier} })
}

const withJog = Component => {
  const HOC = props => (
    <Component {...props} jog={jog(props)}/>
  )
  return withCreateTask(HOC)
}

export default withJog
