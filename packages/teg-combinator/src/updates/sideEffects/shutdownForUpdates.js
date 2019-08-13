const shutdownForUpdates = () => {
  // eslint-disable-next-line no-console
  console.error('Shutting down for updates')

  setImmediate(() => {
    process.exit(0)
  })
}

export default shutdownForUpdates
