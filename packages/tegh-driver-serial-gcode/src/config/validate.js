import fs from 'fs'

const validate = (config) => {
  const errors = []

  return {
    valid: errors.length === 0,
    errors,
  }
}

export default validate
