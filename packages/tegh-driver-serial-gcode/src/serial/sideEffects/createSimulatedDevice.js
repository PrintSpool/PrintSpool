import fs from 'fs'
import Promise from 'bluebird'

const createSimulatedDevice = async (controllerConfig) => {
  const file = controllerConfig.get('serialPortID')
  await Promise.promisify(fs.writeFile)(file, '')
}

export default createSimulatedDevice
