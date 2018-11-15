import { GraphQLObjectType } from 'graphql'
import tql from 'typiql'
import snl from 'strip-newlines'

import isIdle from '../../spool/selectors/isIdle'
import getComponentsState from '../selectors/getComponentsState'

import PrinterStatusEnum from './PrinterStatusEnum.graphql.js'
import HeaterType from './Heater.graphql.js'
import FanType from './Fan.graphql.js'
import LogEntryType from '../../log/types/LogEntry.graphql.js'
import MacroDefinitionType from '../../config/types/MacroDefinition.graphql.js'
import PrinterErrorType from './PrinterError.graphql.js'

const PrinterGraphQL = new GraphQLObjectType({
  name: 'Printer',
  fields: () => ({
    id: {
      type: tql`ID!`,
      resolve(source) {
        return source.config.printer.id
      },
    },
    name: {
      type: tql`String!`,
      resolve(source) {
        return source.config.printer.name
      },
    },
    heaters: {
      type: tql`[${HeaterType}!]!`,
      resolve(source) {
        return getComponentsState(source).heaters.toList()
      },
    },
    targetTemperaturesCountdown: {
      type: tql`Float`,
      description: snl`
        The estimated number of seconds until the heater(s) reach their
        targetTemperature.
      `,
      resolve(source) {
        return getComponentsState(source).targetTemperaturesCountdown
      },
    },
    activeExtruderID: {
      type: tql`String`,
      description: snl`
        The active extruder ID
      `,
      resolve(source) {
        return getComponentsState(source).activeExtruderID
      },
    },
    fans: {
      type: tql`[${FanType}!]!`,
      resolve(source) {
        return getComponentsState(source).fans.toList()
      },
    },
    status: {
      type: tql`${PrinterStatusEnum}!`,
      resolve: (source) => {
        if (!isIdle(source.spool)) return 'PRINTING'
        const { status } = source.status
        return status.substring(status.lastIndexOf('/') + 1)
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

export default PrinterGraphQL
