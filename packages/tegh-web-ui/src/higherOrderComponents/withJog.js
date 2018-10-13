import withSpoolMacro from './withSpoolMacro'

const jog = ({ spoolMacro }) => (axis, direction, distance) => () => {
  const multiplier = (() => {
    switch (direction) {
      case '+': return 1
      case '-': return -1
      default: throw new Error(`invalid direction ${direction}`)
    }
  })()
  spoolMacro({ macro: 'moveBy', args: { [axis]: distance * multiplier } })
}

const withJog = (Component) => {
  const HOC = props => (
    <Component {...props} jog={jog(props)} />
  )
  return withSpoolMacro(HOC)
}

export default withJog
