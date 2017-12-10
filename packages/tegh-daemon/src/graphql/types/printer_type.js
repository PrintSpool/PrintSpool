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
      resolve(source) {
        return source.config.id
      },
    },
    name: {
      type: tql`String!`,
      resolve(source) {
        return source.config.name
      },
    },
    // mode: {
    //   type: tql`${PrinterModeEnum}!`,
    // },
    heaters: {
      type: tql`[${HeaterType}!]!`,
      resolve(source) {
        return source.driver.heaters
      },
    },
    fans: {
      type: tql`[${FanType}!]!`,
      resolve(source) {
        return source.driver.fans
      },
    },
    // jobQueue: {
    //   type: tql`[${JobType}!]!`,
    // },
  })
})

export default Printer
