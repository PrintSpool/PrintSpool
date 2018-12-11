import fs from 'fs'
import Promise from 'bluebird'

const createSimulatedDevice = async (serialPortID) => {
  await Promise.promisify(fs.writeFile)(serialPortID, '')
}

export default createSimulatedDevice
