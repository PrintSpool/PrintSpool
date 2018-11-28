const PrinterConfigResolvers = {
  PrinterConfig: {
    plugins: (source, args) => {
      if (args.package != null) {
        const plugin = source.plugins.find(p => p.package === args.package)
        if (plugin == null) return []
        return [plugin]
      }
      return source.plugins
    },
  },
}

export default PrinterConfigResolvers
