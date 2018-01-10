import _ from 'lodash'

const macrosReducer = ({ loadPlugin, config }) => {
  const initialState = {}
  Object.entries(config.macros).forEach(([pluginName, opts]) => {
    const plugin = loadPlugin(pluginName)
    Object.entries(plugin)
      .filter(([name]) => opts === 'all' || opts.includes(name))
      .forEach(([name, run]) => {
        initialState[name] = {
          name,
          run,
        }
      })
  })
  return (state = initialState) => state
}

export default macrosReducer
