import {
  GraphQLEnumType
} from 'graphql'

const PrinterModeEnum = new GraphQLEnumType({
  name: 'PrinterMode',
  values: {
    INITIALIZING: {
      value: 0,
      description: `
        The printer is being initialized. No GCodes will be executed until the
        printer is finished initializing. Homing, moving, printing, estopping,
        or setting of target_temp or enabled attributes will result in a
        runtime.sync error durring initialization.
      `,
    },
    ESTOPPED: {
      value: 1,
      description: `
        The printer is estopped. Homing, moving, printing, estopping, or
        setting of target_temp or enabled attributes will result in a
        runtime.sync error durring an estop.
      `,
    },
    MANUAL: {
      value: 2,
      description: `
        The printer is idle or under manual control via a move, home or set
        action.
      `,
    },
    PRINTING: {
      value: 3,
      description: `
        The printer is printing a print job. Homing, moving, printing, or
        setting of target_temp or enabled attributes will result in a
        runtime.sync error durring a print.
      `,
    },
  }
})

export default PrinterModeEnum
