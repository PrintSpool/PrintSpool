import index from './index.graphql'
import config from './schemaModules/config.graphql'
import devices from './schemaModules/devices.graphql'
import jobQueue from './schemaModules/jobQueue.graphql'
import machine from './schemaModules/machine.graphql'
import spool from './schemaModules/spool.graphql'

const tegTypeDefs = [
  index,
  config,
  devices,
  jobQueue,
  machine,
  spool,
]

export default tegTypeDefs
