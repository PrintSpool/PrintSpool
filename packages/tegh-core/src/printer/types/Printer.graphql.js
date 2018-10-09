import { GraphQLObjectType } from 'graphql'
import tql from 'typiql'
import snl from 'strip-newlines'

import isIdle from '../../spool/selectors/isIdle'
import getDriverState from '../selectors/getDriverState'
1
import PrinterStatusEnum from './PrinterStatusEnum.graphql'
import HeaterType from './Heater.graphql'
import FanType from './Fan.graphql'
import LogEntryType from '../../log/types/LogEntry.graphql'
import MacroDefinitionType from '../../config/types/MacroDefinition.graphql'
import PrinterErrorType from './PrinterError.graphql'

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
    },
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
        return source.status.status
      },
    },
    error: {
      type: tql`${PrinterErrorType}`,
      resolve: source => source.status.error,
    },
    macroDefinitions: {
      type: tql`[${MacroDefinitionType}!]!`,
      resolve: source => source.macros.keys(),
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
