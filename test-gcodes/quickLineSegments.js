// RUN: npx babel-node ./gcodes/quickLineSegments.js
import path from 'path'
import fs from 'fs'

const feedrate = 20 // mm per minute. slower = less acceleration time
const numberOfCircles = 1000
const distance = 1


const mmPerSecond = feedrate * 60

const diagonal = distance * Math.sin(Math.PI / 2)

const filePath = path.join(__dirname, 'quickLineSegments.gcode')

const center = 50

const header = `
  ; header
  G21
  G28
  G90
  G1 X${center} Y${center} F9000
`.replace(/\n\s+/g, '\n')

const moveInACircle = `
  ; circle
  G1 X${center + distance} F${mmPerSecond}
  G1 X${center + diagonal} Y${center + diagonal} F${mmPerSecond}
  G1 Y${center + distance} F${mmPerSecond}
  G1 X${center - diagonal} Y${center + diagonal} F${mmPerSecond}
  G1 X${center - distance} F${mmPerSecond}
  G1 X${center - diagonal} Y${center - diagonal} F${mmPerSecond}
  G1 Y${center - distance} F${mmPerSecond}
  G1 X${center + diagonal} Y${center - diagonal} F${mmPerSecond}
`.replace(/\n\s+/g, '\n')


let gcode = `${header}\n\n`

for (let i = 0; i < numberOfCircles; i++) {
  gcode += `${moveInACircle}\n\n`
}

fs.writeFileSync(filePath, gcode)

console.log(`gcode written to ${filePath}`)
