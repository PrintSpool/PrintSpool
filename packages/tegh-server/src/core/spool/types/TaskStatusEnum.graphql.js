import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLEnumType
} from 'graphql'

const JobStatusEnumGraphQLType = new GraphQLEnumType({
  name: 'JobStatus',
  values: {
    QUEUED: {
      value: 0,
      description: snl`
        The job is queued for printing.
      `,
    },
    SLICING: {
      value: 1,
      description: snl`
        The print job’s 3D model is being sliced into gcode before printing.
      `,
    },
    PRINTING: {
      value: 2,
      description: snl`
        The print job is in the process of being printed.
      `,
    },
    ESTOPPED: {
      value: 3,
      description: snl`
        An estop action was received by the printer during the print and the
        print job was halted.
      `,
    },
    // TODO: should "done" be a thing? The print job was successfully printed.
  }
})

export default JobStatusEnumGraphQLType
