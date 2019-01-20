import { createSelector } from 'reselect'

const toGCodeLine = createSelector(
  despoolPayload => despoolPayload,
  ({ macro, args }) => {
    if (
      typeof macro !== 'string'
      || macro.length === 0
    ) {
      throw new Error(`Invalid macro ${JSON.stringify(macro)}`)
    }

    const argsString = Object.entries(args)
      .map(([k, v]) => `${k.toUpperCase()}${v}`)
      .join(' ')
    const line = `${macro} ${argsString}`

    return line
  },
)

export default toGCodeLine
