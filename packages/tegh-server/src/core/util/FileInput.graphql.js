const FileInputType = new GraphQLInputObjectType({
  name: 'FileInput',
  fields: {
    name: {
      type: tql`String!`
    },
    content: {
      type: tql`String!`
    },
  },
})

export default FileInputType
