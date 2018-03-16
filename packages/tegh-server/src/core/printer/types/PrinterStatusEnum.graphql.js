import {
  GraphQLEnumType
} from 'graphql'

const PrinterStatusEnum = new GraphQLEnumType({
  name: 'PrinterStatusEnum',
  values: {
    CONNECTING: {
      description: `
        The printer is being initialized. Attempting to spool anything will
        result in an error.
      `,
    },
    READY: {
      description: `
        The printer is connected and may be able to spool tasks/jobs depending
        on the state of \`printer.isIdle\`.
      `,
    },
    DISCONNECTED: {
      description: `
        The printer is disconnected or turned off.
      `,
    },
    ERRORED: {
      description: `
        The printer is being initialized. Attempting to spool anything will
        result in an error.
      `,
    },
    ESTOPPED: {
      description: `
        The printer is estopped. Attempting to spool anything except for an
        emergency macro (ie. reset) will result in an error. Spool the \`reset\`
        macro to reset the estop and change the status to \`CONNECTING\`.
      `,
    },
  }
})

export default PrinterStatusEnum
