import tql from 'typiql'
import * as jiff from 'jiff'
import { PubSub } from 'graphql-subscriptions'

import Live from '../../../../../graphql-live-subscription/src/GraphQLLiveSubscription'

import subscriptionDefaults from '../../util/subscriptionDefaults'
import JobGraphQL from '../types/Job.graphql.js'

import {
  parse,
  execute,
  GraphQLSchema,
  introspectionQuery,
  GraphQLObjectType,
} from 'graphql'

const eventName = 'jobsChanged'

const selector = state => state.jobQueue.jobs.toList()

const liveJob = () => Live({
  name: 'LiveJob',
  type: tql`[${JobGraphQL}!]`,
})

const jobs = () => ({
  name: 'jobs',
  type: tql`${liveJob()}!`,

  subscribe: async (_source, args, { store }, resolveInfo) => {

    /*
     * build a query for the query node that can be executed on state change
     * in order to create query diffs
     */
    const rootField = resolveInfo.fieldNodes[0]

    const queryField = rootField
      .selectionSet
      .selections
      .find(selection => selection.name.value === 'query')

    const buildArgumentString = argumentNode => {
      const name = argumentNode.name.value
      const value = argumentNode.value.value
      return `${name}: ${value}`
    }

    const buildQueryFromFieldNode = fieldNode => {
      const name = fieldNode.name.value

      const args = fieldNode.arguments.map(buildArgumentString)
      const argsString = args.length === 0 ? '' : `(${args.join(', ')})`

      const fieldString = `${name}${argsString}`

      if (fieldNode.selectionSet == null) return fieldString

      const children = fieldNode
        .selectionSet
        .selections

      return (
        `${fieldString} {\n` +
          children.map(child =>
            `  ${ buildQueryFromFieldNode(child).replace(/\n/g, `\n  `) }\n`
          ).join('') +
        `}`
      )
    }

    const queryString = `
      query {
        ${buildQueryFromFieldNode(queryField)}
      }
    `

    const documentAST = parse(queryString)
    const querySchema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'QuerySchemaRoot',
        fields: () => ({
          query: {
            type: tql`[${JobGraphQL}!]`,
          },
        }),
      }),
    })

    const executeQuery = async state => {
      const { data, errors } = await execute(
        querySchema,
        documentAST,
        {
          query: state,
        },
        {
          store,
        },
      )
      if (errors) throw new Error(errors[0])
      return data.query
    }

    /* ---- */

    const connectionPubSub = new PubSub()

    const getSelectorValue = () => selector(store.getState()).toJS()

    let previousState

    const publishInitialQuery = async () => {
      const selectorValue = getSelectorValue()
      previousState = await executeQuery(selectorValue)

      connectionPubSub.publish(eventName, {
        query: selectorValue,
      })
    }

    setImmediate(async () => {
      /* immediately send the query results upon connection */
      await publishInitialQuery()

      store.subscribe(async () => {
        /* send query result diffs on store changes */
        const nextState = await executeQuery(getSelectorValue())
        const data = {
          patches: jiff.diff(previousState, nextState),
        }
        previousState = nextState
        connectionPubSub.publish(eventName, data)
      })
    })

    return connectionPubSub.asyncIterator(eventName)
  },

  resolve(source) {
    // console.log(JSON.stringify(source))
    return source
  },
})

export default {
  subscription: jobs,
  selector,
}
