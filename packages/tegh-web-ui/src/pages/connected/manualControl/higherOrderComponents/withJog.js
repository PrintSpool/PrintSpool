import React from 'react'
import withSpoolMacro from '../../shared/higherOrderComponents/withSpoolMacro'

const jog = ({ spoolMacro }) => (
  printerID,
  axis,
  direction,
  distance,
) => () => {
  const multiplier = (() => {
    switch (direction) {
      case '+': return 1
      case '-': return -1
      default: throw new Error(`invalid direction ${direction}`)
    }
  })()
  spoolMacro({
    printerID,
    macro: 'moveBy',
    args: { [axis]: distance * multiplier },
  })
}

const withJog = (Component) => {
  const HOC = props => (
    <Component {...props} jog={jog(props)} />
  )
  return withSpoolMacro(HOC)
}

export default withJog
