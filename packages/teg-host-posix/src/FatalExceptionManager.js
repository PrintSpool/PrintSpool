import fs from 'fs'
import path from 'path'
import writeFileAtomic from 'write-file-atomic'

const errorLogFilename = (config) => {
  const errorDir = config.host.crashReports.directory
  return path.join(errorDir, 'crash_log.json')
}

const writeErrorLog = (json, config) => {
  writeFileAtomic.sync(
    errorLogFilename(config),
    JSON.stringify(json, null, 2),
    {
      mode: 0o660,
    },
  )
}

// The onFatalException handler attempts to save the error
// to disk before exiting.
const onFatalException = (err, config) => {
  try {
    const date = new Date()
    const json = {
      date: date.toUTCString(),
      message: err.message,
      stack: err.stack,
      // state: store == null ? null : {
      //   ...store.getState(),
      //   log: '[REDACTED]',
      //   spool: '[REDACTED]',
      // },
      seen: false,
    }
    writeErrorLog(json, config)
  } catch (handlerError) {
    // An error in the error uncaught exception handler is unrecoverable.
    // Print the error and exit.
    // eslint-disable-next-line no-console
    console.error(handlerError, '\n', handlerError.stack)
  }

  process.exitCode = 1
}

// eslint-disable-next-line
export const handleFatalExceptions = ({ config }) => {
  // const handler = (err) => {
  //   onFatalException(err, config)
  // }

  // process.on('unhandledRejection', handler)
  // process.on('uncaughtException', handler)
}

export const getPreviousFatalException = ({ config }) => {
  try {
    const filename = errorLogFilename(config)
    const json = JSON.parse(fs.readFileSync(filename))

    if (json.seen) return null
    json.seen = true
    writeErrorLog(json, config)

    return json
  } catch (loadError) {
    if (loadError.code === 'ENOENT') {
      // if the error log file does not exist then continue to boot the server
      // as usual.
      return null
    }
    throw loadError
  }
}
