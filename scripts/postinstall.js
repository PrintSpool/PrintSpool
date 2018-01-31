import fs from 'fs'
import path from 'path'
import lerna from 'lerna'
import childProcess from 'child_process'
import Promise from 'bluebird'

import symlink from './symlink'

const LINE = Array(80).join('-')
const dir = path.join(__dirname, '..')

const postInstall = async () => {
  console.log(`${LINE}\nPOST INSTALL\n${LINE}`)
  await new lerna.BootstrapCommand([], [], dir).run()
  await symlink()
  await new lerna.RunCommand(['build'], {parallel: true}, dir).run()
}

postInstall().then(() => {
  console.log(`${LINE}\nPOST INSTALL [DONE]\n${LINE}`)
})
