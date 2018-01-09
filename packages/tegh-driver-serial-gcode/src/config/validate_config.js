import fs from 'fs'

const validateConfig = (config) => {
  const errors = []
  if (!fs.existsSync(config.driver.serialPort.path)) {
    errors.push(
      `Serial port not found (${config.driver.serialPort.path}). ` +
      `Please confirm that the printer USB cable is plugged in.`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export default validateConfig
