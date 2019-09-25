import getMaterialForToolhead from '../selectors/getMaterialForToolhead'

const ToolheadResolvers = {
  Toolhead: {
    currentMaterial: (source, args, { store }) => {
      const { config } = store.getState()
      return getMaterialForToolhead({
        combinatorConfig: config,
        toolhead: source,
      })
    },
  },
}

export default ToolheadResolvers
