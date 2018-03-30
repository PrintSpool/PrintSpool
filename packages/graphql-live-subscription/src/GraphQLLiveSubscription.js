import {
  GraphQLObjectType,
} from 'graphql'
import memoize from 'fast-memoize'
import tql from 'typiql'

import RFC4627Patch from './rfc4627/RFC4627Patch'

const GraphQLLiveSubscription = (options = {}) => {
  const { type, name, resumption } = options

  if (type == null) {
    throw new Error('Canot create a GraphQLLiveSubscription of type null')
  }
  return new GraphQLObjectType({
    name: name || `LiveSubscriptionOf${type.toString()}`,

    fields: () => {
      const fields = {
        query: {
          type,
        },
        patches: {
          type: tql`[${RFC4627Patch}!]`,
        },
      }

      if (resumption === true) {
        return {
          ...fields,
          resumptionCursor: {
            type: tql`ID!`,
          },
        }
      }

      return fields
    }
  })
}

export default memoize(GraphQLLiveSubscription)
