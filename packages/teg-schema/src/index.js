import fs from 'fs'

import index from './index.graphql.js'
import auth from './schemaModules/auth.graphql.js'
import config from './schemaModules/config.graphql.js'
import devices from './schemaModules/devices.graphql.js'
import jobQueue from './schemaModules/jobQueue.graphql.js'
import machine from './schemaModules/machine.graphql.js'
import spool from './schemaModules/spool.graphql.js'

const tegTypeDefs = [
  index,
  auth,
  config,
  devices,
  jobQueue,
  machine,
  spool,
]

export default tegTypeDefs
