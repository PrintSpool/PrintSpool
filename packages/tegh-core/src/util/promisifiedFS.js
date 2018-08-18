import fs from 'fs'
import Promise from 'bluebird'

const promsifiedFS = Promise.promisifyAll(fs)

export default promsifiedFS
