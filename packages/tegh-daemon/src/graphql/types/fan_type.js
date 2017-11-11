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
      // TODO: should this be a Float Percentage?
      description: snl`
        The speed of the fan (0 - 255).
      `,
    },
  })
})

export default FanType
