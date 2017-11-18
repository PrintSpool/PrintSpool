import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'

import JobStatusEnum from './job_status_enum.js'

const JobType = new GraphQLObjectType({
  name: 'Job',
  fields: () => ({
    id: {
      type: tql`ID!`,
    },
    status: {
      type: tql`${JobStatusEnum}!`,
    },
    fileName: {
      type: tql`String!`,
      description: snl`
        The file name of the 3D model or gcode file.
      `,
    },
    qty: {
      type: tql`Int!`,
      description: snl`
        The number of copies of the 3D model or gcode file to print. Cannot be
        set to less then the qty_printed value.
      `,
    },
    qtyPrinted: {
      type: tql`Int`,
      description: snl`
        The number of copies of the 3D model or gcode that have already been
        printed.
      `,
    },
    totalLines: {
      type: tql`Int`,
      description: snl`
        The total number of lines in the gcode file. This is left undefined
        until the print job is sliced.
      `,
    },
    currentLine: {
      type: tql`Int`,
      description: snl`
        The last line number in the gcode file that was sent to the printer.
      `,
    },
    startTime: {
      // TODO: DateTime GraphQL Type
      type: tql`Int`,
      description: snl`
        The POSIX time that the print job started in milliseconds.
      `,
    },
    elapsedTime: {
      // TODO: DateTime GraphQL Type
      type: tql`Int`,
      description: snl`
        The time in milliseconds the print job took to complete. This is
        undefined until the completion of the print job.
      `,
    },

    // TODO? slicing_engine [STRING] settable - The name of the slicing engine to slice this print job with (ex. curra_engine)
    // TODO? slicing_profile [STRING] settable - The name of the slicing profile to slice this print job with.

  })
})

export default JobType
