import index from './index.graphql'
import config from './schemaModules/config.graphql'
import devices from './schemaModules/devices.graphql'
import jobQueue from './schemaModules/jobQueue.graphql'
import printer from './schemaModules/printer.graphql'
import spool from './schemaModules/spool.graphql'

const teghTypeDefs = [
  index,
  config,
  devices,
  jobQueue,
  printer,
  spool,
]

export default teghTypeDefs
