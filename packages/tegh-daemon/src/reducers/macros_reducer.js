import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import { transform } from 'babel-core'
const { NodeVM } = require('vm2')

const vm = new NodeVM({
  sandbox: {},
})

const macrosReducer = ({ configPath }) => {
  const macrosDir = path.join(path.dirname(configPath), 'macros')
  if (!fs.existsSync(macrosDir)) fs.mkdirSync(macrosDir)
  const macros = {}
  fs.readdirSync(macrosDir).forEach(fileName => {
    const name = path.basename(fileName, '.gcode.ejs')
    const filePath = path.join(macrosDir, fileName)
    const fileContent = fs.readFileSync(filePath)
    const { code } = transform(fileContent, {
      presets: ["env"]
    })
    const SandboxedMacroFn = vm.run(code)
    macros[name] = SandboxedMacroFn
  })

  return (state = macros) => state
}

export default macrosReducer
