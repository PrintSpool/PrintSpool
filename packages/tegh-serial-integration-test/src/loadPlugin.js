const loadPlugin = (plugin) => new Promise((resolve) => {
  resolve(require(plugin))
})

export default loadPlugin
