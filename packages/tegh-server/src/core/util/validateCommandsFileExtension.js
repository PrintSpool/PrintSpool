const allowedExtensions = ['.gcode', '.ngc']

const validateCommandsFileExtension = (name) => {
  const isValid = allowedExtensions.some(ext => name.endsWith(ext))

  if (!isValid) {
    throw new Error(
      'file name must end in one of' + allowedExtensions.join(', ')
    )
  }
}

export default validateCommandsFileExtension
