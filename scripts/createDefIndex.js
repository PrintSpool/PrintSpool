const fs = require('fs')
const path = require('path')

const machinesDir = path.join(__dirname, '../defs/staging/definitions')

const filenames = fs.readdirSync(machinesDir)

// console.log(filenames)

const index = {}

filenames.forEach((filename) => {
  const filepath = path.join(machinesDir, filename)

  const {
    name,
    version,
    inherits,
    metadata,
  } = JSON.parse(fs.readFileSync(filepath))

  if (metadata == null) {
    console.error('WARNING:', filename, 'has null metadata')
  }

  const {
    visible = false,
    manufacturer = '',
    category = 'Other',
    file_formats: formats = [],
  } = metadata || {}

  index[`/definitions/${filename}`] = {
    name,
    manufacturer,
    category,
    version,
    inherits,
    visible,
    fileFormats: typeof formats === 'string' ? formats.split(';') : formats,
  }
})

const indexPath = path.join(__dirname, '../defs/staging/index.json')

fs.writeFileSync(indexPath, JSON.stringify(index, null, 2))
