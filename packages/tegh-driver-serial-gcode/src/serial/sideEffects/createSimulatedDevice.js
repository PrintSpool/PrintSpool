import fs from 'fs'
import Promise from 'bluebird'

const createSimulatedDevice = async (controllerConfig) => {
  await Promise.promisify(fs.writeFile)(controllerConfig.serialPortID, '')
}

export default createSimulatedDevice
