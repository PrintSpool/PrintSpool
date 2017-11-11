import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import tql from 'typiql'

import PrinterModeEnum from './printer_mode_enum.js'
import HeaterType from './heater_type.js'
import FanType from './fan_type.js'
import JobType from './job_type.js'

const Printer = new GraphQLObjectType({
  name: 'Printer',
  fields: () => ({
    id: {
      type: tql`ID!`,
    },
    name: {
      type: tql`String!`,
    },
    // mode: {
    //   type: tql`${PrinterModeEnum}!`,
    // },
    extruders: {
      type: tql`[${HeaterType}!]!`,
    },
    beds: {
      type: tql`[${HeaterType}!]!`,
    },
    fans: {
      type: tql`[${FanType}!]!`,
    },
    // jobQueue: {
    //   type: tql`[${JobType}!]!`,
    // },
  })
})

export default Printer
