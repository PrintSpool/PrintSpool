import tql from 'typiql'
import snl from 'strip-newlines'
import {
  GraphQLObjectType
} from 'graphql'

const FanType = new GraphQLObjectType({
  name: 'Fan',
  fields: () => ({
    id: {
      type: tql`ID!`,
    },
    name: {
      type: tql`String!`,
    },
    enabled: {
      type: tql`Boolean!`,
      description: snl`
        True if the fan is on.
      `,
    },
    speed: {
      type: tql`Int!`,
      description: snl`
        The speed of the fan as a percentage of full speed (range: 0 to 100).
      `,
    },
  })
})

export default FanType
