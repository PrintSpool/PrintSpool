import {
  GraphQLInputObjectType,
} from 'graphql'
import tql from 'typiql'

const FileInputType = new GraphQLInputObjectType({
  name: 'FileInput',
  fields: {
    name: {
      type: tql`String!`,
    },
    content: {
      type: tql`String!`,
    },
  },
})

export default FileInputType
