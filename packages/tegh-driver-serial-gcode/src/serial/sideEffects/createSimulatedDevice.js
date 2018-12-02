import fs from 'fs'
import Promise from 'bluebird'

const createSimulatedDevice = async (controllerConfig) => {
  console.log(controllerConfig.serialPortID)
  await Promise.promisify(fs.writeFile)(controllerConfig.serialPortID, '')
}

export default createSimulatedDevice
