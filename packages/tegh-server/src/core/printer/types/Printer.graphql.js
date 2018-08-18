import { GraphQLObjectType } from 'graphql'
import tql from 'typiql'
import snl from 'strip-newlines'

import isIdle from '../../spool/selectors/isIdle'
import getDriverState from '../selectors/getDriverState'
import getMacroDefinitions from '../../config/selectors/getMacroDefinitions'

import PrinterStatusEnum from './PrinterStatusEnum.graphql.js'
import HeaterType from './Heater.graphql.js'
import FanType from './Fan.graphql.js'
import LogEntryType from '../../log/types/LogEntry.graphql.js'
import MacroDefinitionType from '../../macros/types/MacroDefinition.graphql.js'
import PrinterErrorType from './PrinterError.graphql.js'

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
    heaters: {
      type: tql`[${HeaterType}!]!`,
      resolve(source) {
        return Object.values(getDriverState(source).peripherals.heaters)
      },
    },
    targetTemperaturesCountdown: {
      type: tql`Float`,
      description: snl`
        The estimated number of seconds until the heater(s) reach their
        targetTemperature.
      `,
      resolve(source) {
        return getDriverState(source).peripherals.targetTemperaturesCountdown
      },
    },
    activeExtruderID: {
      type: tql`String`,
      description: snl`
        The active extruder ID
      `,
      resolve(source) {
        return getDriverState(source).peripherals.activeExtruderID
      },
    }
    fans: {
      type: tql`[${FanType}!]!`,
      resolve(source) {
        return Object.values(getDriverState(source).peripherals.fans)
      },
    },
    status: {
      type: tql`${PrinterStatusEnum}!`,
      resolve: (source) => {
        if (!isIdle(source)) return 'PRINTING'
        return getDriverState(source).status.status
      },
    },
    error: {
      type: tql`${PrinterErrorType}`,
      resolve: source => getDriverState(source).status.error,
    },
    macroDefinitions: {
      type: tql`[${MacroDefinitionType}!]!`,
      resolve: source => getMacroDefinitions(source.config),
    },
    logEntries: {
      type: tql`[${LogEntryType}!]`,
      args: {
        level: {
          type: tql`String`,
        },
        source: {
          type: tql`String`,
        },
      },
      resolve(source, args) {
        let entries = source.log.get('entries')
        if (args.level != null) {
          entries = entries.filter(log => log.level === args.level)
        }
        if (args.source != null) {
          entries = entries.filter(log => log.source === args.source)
        }
        return entries.toArray()
      },
    },
  }),
})

export default Printer
