import snl from 'strip-newlines'
import {
  GraphQLEnumType,
} from 'graphql'

const PrinterStatusEnum = new GraphQLEnumType({
  name: 'PrinterStatusEnum',
  values: {
    CONNECTING: {
      description: snl`
        The printer is being initialized.
        Attempting to spool anything will result in an error.
      `,
    },
    READY: {
      description: snl`
        The printer is connected and able to spool tasks/jobs.
      `,
    },
    PRINTING: {
      description: snl`
        The printer is printing a job.
        Attempting to spool anything will result in an error.
      `,
    },
    DISCONNECTED: {
      description: snl`
        The printer is disconnected or turned off.
        Attempting to spool anything will result in an error.
      `,
    },
    ERRORED: {
      description: snl`
        The printer is being initialized.
        Attempting to spool anything except for an
        emergency macro (ie. reset) will result in an error. Spool the \`reset\`
        macro to reset the error and change the status to \`CONNECTING\`.
      `,
    },
    ESTOPPED: {
      description: snl`
        The printer is estopped. Attempting to spool anything except for an
        emergency macro (ie. reset) will result in an error. Spool the \`reset\`
        macro to reset the estop and change the status to \`CONNECTING\`.
      `,
    },
  },
})

export default PrinterStatusEnum
