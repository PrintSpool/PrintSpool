/* jobQueue */
export { default as createJob } from './jobQueue/mutations/createJob.graphql.js'
export { default as createLocalFileJob } from './jobQueue/mutations/createLocalFileJob.graphql.js'
/* spool */
export { default as spoolCommands } from './spool/mutations/spoolCommands.graphql.js'
export { default as spoolJobFile } from './spool/mutations/spoolJobFile.graphql.js'
export { default as spoolMacro } from './spool/mutations/spoolMacro.graphql.js'
export { default as cancelTask } from './spool/mutations/cancelTask.graphql.js'
