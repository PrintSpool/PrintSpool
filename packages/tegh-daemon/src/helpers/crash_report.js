import fs from 'fs'
import path from 'path'
import domain from 'domain'
import _ from 'lodash'
import Raven from "raven"

const RAVEN_DSN = (
  'https://57180e7f8e5f4141b0a69c76b8bf279a:040f6fef809142cb86e4b776647d862d@sentry.io/266958'
)

export const loadCrashReport = (errorDir) => {
  const fileName = _.max(fs.readdirSync(errorDir))
  if (fileName == null) return null
  const fullPath = path.join(errorDir, fileName)
  const json = JSON.parse(fs.readFileSync(fullPath))
  if (json.seen) return null
  json.seen = true
  fs.writeFileSync(fullPath, JSON.stringify(json, null, 2))
  return json
}

export const onUncaughtException = ({
  errorDir,
  getRavenContext = () => Raven.getContext(),
  uninstallRaven = () => Raven.uninstall(),
}) => {
  let alreadyCrashing = false
  return (err) => {
    if (alreadyCrashing) throw err
    alreadyCrashing = true
    const date = new Date()
    const crashReport = {
      date: date.toUTCString(),
      source: 'server',
      level: 'fatal',
      message: err.message,
      stack: err.stack,
      ravenContext: getRavenContext(),
      seen: false,
    }
    uninstallRaven()
    fs.writeFileSync(
      path.join(errorDir, `tegh_crash_report_${date.getTime()}.json`),
      JSON.stringify(crashReport, null, 2),
      {
        mode: 0o660,
      }
    )
    throw err
  }
}

export const wrapInCrashReporting = ({config, configPath}, cb) => {
  /*
   * Load the previous crash crash report
   */
  const errorDir = path.join(path.dirname(configPath), 'log')
  if (!fs.existsSync(errorDir)) fs.mkdirSync(errorDir)
  const crashReport = loadCrashReport(errorDir)
  /*
   * Upload fatal errors to Sentry via raven after the service is restarted
   */
  if (config.uploadCrashReportsToDevs) {
    // Raven.disableConsoleAlerts()
    Raven
      .config(RAVEN_DSN, { captureUnhandledRejections: false })
      .install((e) => { console.error(e) })
    if (crashReport != null) {
      /*
       * Recreate the error and raven context from the crashReport so it
       * can be uploaded. Raven is reset aftwards.
       */
      const syntheticError = new Error(crashReport.message)
      syntheticError.stack = crashReport.stack
      Raven._globalContext = crashReport.ravenContext
      Raven.captureException(syntheticError)
      Raven._globalContext = {}
    }
  }
  /*
   * Treat unhandledRejections from promises the same as uncaught exceptions
   */
  process.on('unhandledRejection', (e) => {
    throw e
  })
  /*
   * Run the callback inside a domain that will capture its fatal errors in
   * crash report logs.
   */
  const wrapperDomain = domain.create()
  wrapperDomain.on('error', onUncaughtException({ errorDir }))
  wrapperDomain.run(() => cb({ crashReport }))
}
