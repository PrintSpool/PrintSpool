import fs from 'fs'
import path from 'path'
import lerna from 'lerna'

const LINE = Array(80).join('-')
const dir = path.join(__dirname, '..')

const symlinks = [
  {
    from: 'serial-middleware',
    inTo: 'tegh-driver-serial-gcode',
  },
  {
    from: 'tegh-daemon',
    inTo: 'tegh-serial-integration-test',
  },
  {
    from: 'tegh-driver-serial-gcode',
    inTo: 'tegh-serial-integration-test',
  },
  {
    from: 'tegh-macros-default',
    inTo: 'tegh-serial-integration-test',
  },
]

const postInstall = async () => {
  console.log(`${LINE}\nPOST INSTALL\n${LINE}`)
  await new lerna.BootstrapCommand([], [], dir).run()
  console.log(`Symlinking local dependencies`)
  symlinks.forEach(({ from, inTo }) => {
    const nodeModules = path.join(dir, 'packages', inTo, 'node_modules')
    const symlinkPath = path.join(nodeModules, from)
    if (!fs.existsSync(nodeModules)) fs.mkdirSync(nodeModules)
    if (fs.existsSync(symlinkPath)) fs.unlinkSync(symlinkPath)
    fs.symlinkSync(
      path.join(dir, 'packages', from),
      symlinkPath,
    )
  })
  console.log(`Symlinking local dependencies [DONE]`)
  await new lerna.RunCommand(['build'], {parallel: true}, dir).run()
}

postInstall().then(() => {
  console.log(`${LINE}\nPOST INSTALL [DONE]\n${LINE}`)
})
