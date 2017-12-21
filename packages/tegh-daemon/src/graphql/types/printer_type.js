import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import tql from 'typiql'
import snl from 'strip-newlines'

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
        return Object.values(source.driver.heaters)
      },
    },
    targetTemperaturesCountdown: {
      type: tql`Float`,
      description: snl`
        The estimated number of seconds until the heater(s) reach their
        targetTemperature.
      `,
      resolve(source) {
        return source.driver.targetTemperaturesCountdown
      },
    },
    fans: {
      type: tql`[${FanType}!]!`,
      resolve(source) {
        return Object.values(source.driver.fans)
      },
    },
    // jobQueue: {
    //   type: tql`[${JobType}!]!`,
    // },
    ready: {
      type: tql`Boolean!`,
      resolve(source) {
        return source.driver.ready
      },
    },
  })
})

export default Printer
