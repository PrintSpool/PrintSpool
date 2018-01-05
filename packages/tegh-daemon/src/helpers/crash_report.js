import fs from 'fs'
import path from 'path'
import _ from 'lodash'

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

export const onUncaughtException = (errorDir) => (err) => {
  const date = new Date()
  const crashReport = {
    date: date.toUTCString(),
    source: 'server',
    level: 'fatal',
    message: err.message,
    stack: err.stack,
    seen: false,
  }
  fs.writeFileSync(
    path.join(errorDir, `tegh_crash_report_${date.getTime()}.json`),
    JSON.stringify(crashReport, null, 2),
    {
      mode: 0o660,
    }
  )
   throw err
}
