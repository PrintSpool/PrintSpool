import {
  GraphQLObjectType,
} from 'graphql'
import tql from 'typiql'

const MacroDefinitionType = new GraphQLObjectType({
  name: 'MacroDefinition',
  fields: () => ({
    name: {
      type: tql`String!`,
    },
  }),
})

export default MacroDefinitionType
