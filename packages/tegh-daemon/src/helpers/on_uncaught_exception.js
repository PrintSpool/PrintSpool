const onUncaughtException = (err) => {
  // eslint-disable-next-line no-console
  console.error(`${new Date().toUTCString()} uncaughtException:`, err.message)
  // eslint-disable-next-line no-console
  console.error(err.stack)
  throw err
}

export default onUncaughtException
