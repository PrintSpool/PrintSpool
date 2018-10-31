export const SPOOL_MACRO = '/tegh-core/spool/SPOOL_MACRO'

/*
 * spools the macro with the given args
 *
 * internal?: Boolean [default: false]
 * priority?: TaskPriority [default: macro.priority || NORMAL],
 * macro: String
 * args?: JSON [default: null]
 */
const spoolMacro = ({
  internal = false,
  priority,
  macro,
  args,
}) => {
  if (macro == null) {
    throw new Error('macro must not be null')
  }

  return {
    type: SPOOL_MACRO,
    payload: {
      internal,
      priority,
      macro,
      args,
    },
  }
}

export default spoolMacro
