import fs from 'fs'
import path from 'path'
import lerna from 'lerna'
import childProcess from 'child_process'
import Promise from 'bluebird'

const LINE = Array(80).join('-')
const dir = path.join(__dirname, '..')

const rm = (file) => Promise.promisify(childProcess.exec)(`rm -r ${file}`)

const symlinks = [
  {
    target: 'serial-middleware',
    addTo: 'tegh-driver-serial-gcode',
  },
  {
    target: 'tegh-server',
    addTo: 'tegh-driver-serial-gcode',
  },
  {
    target: 'tegh-server',
    addTo: 'tegh-driver-serial-gcode',
  },
  {
    alias: 'redux-saga',
    target: 'tegh-server/node_modules/redux-saga',
    addTo: 'tegh-driver-serial-gcode',
  },
  {
    target: 'tegh-server',
    addTo: 'tegh-macros-default',
  },
  {
    alias: 'redux-saga',
    target: 'tegh-server/node_modules/redux-saga',
    addTo: 'tegh-serial-integration-test',
  },
  {
    target: 'tegh-server',
    addTo: 'tegh-serial-integration-test',
  },
  {
    target: 'tegh-driver-serial-gcode',
    addTo: 'tegh-serial-integration-test',
  },
  {
    target: 'tegh-web-ui',
    addTo: 'tegh-serial-integration-test',
  },
  {
    target: 'tegh-macros-default',
    addTo: 'tegh-serial-integration-test',
  },
]

const symlink = async () => {
  console.log(`Symlinking local dependencies`)
  for (const { target, alias, addTo } of symlinks) {
    const nodeModules = path.join(dir, 'packages', addTo, 'node_modules')
    const symlinkPath = path.join(nodeModules, alias || target)
    if (!fs.existsSync(nodeModules)) fs.mkdirSync(nodeModules)
    if (fs.existsSync(symlinkPath)) await rm(symlinkPath)
    fs.symlinkSync(
      path.join(dir, 'packages', target),
      symlinkPath,
    )
  }
  console.log(`Symlinking local dependencies [DONE]`)
}

export default symlink

if (require.main === module) symlink().then(() => {})
