/* jobQueue */
export { default as createJob } from './jobQueue/mutations/createJob.graphql'
export { default as createLocalFileJob } from './jobQueue/mutations/createLocalFileJob.graphql'
export { default as deleteJob } from './jobQueue/mutations/deleteJob.graphql'
/* spool */
export { default as spoolCommands } from './spool/mutations/spoolCommands.graphql'
export { default as spoolJobFile } from './spool/mutations/spoolJobFile.graphql'
export { default as spoolMacro } from './spool/mutations/spoolMacro.graphql'
