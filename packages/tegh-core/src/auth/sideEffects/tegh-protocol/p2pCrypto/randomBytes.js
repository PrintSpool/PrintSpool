import crypto from 'crypto'
import Promise from 'bluebird'

const randomBytes = Promise.promisify(crypto.randomBytes)

export default randomBytes
