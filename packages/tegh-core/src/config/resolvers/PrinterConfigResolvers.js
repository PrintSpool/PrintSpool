const PrinterConfigResolvers = {
  PrinterConfig: {
    components: (source, args) => {
      if (args.componentID != null) {
        const components = source.components.find(c => (
          c.id === args.componentID
        ))
        if (components == null) {
          return []
        }
        return [components]
      }
      return source.components
    },
    plugins: (source, args) => {
      if (args.package != null) {
        const plugin = source.plugins.find(p => p.package === args.package)
        if (plugin == null) {
          return []
        }
        return [plugin]
      }
      return source.plugins
    },
  },
}

export default PrinterConfigResolvers
