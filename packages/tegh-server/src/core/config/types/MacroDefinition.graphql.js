import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql'
import tql from 'typiql'
import snl from 'strip-newlines'

const MacroDefinitionType = new GraphQLObjectType({
  name: 'MacroDefinition',
  fields: () => ({
    name: {
      type: tql`String!`,
    },
  }),
})

export default MacroDefinitionType
