import Promise from 'bluebird'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const createJobGraphQL = gql`
  mutation createJob($input: CreateJobInput!) {
    createJob(input: $input) {
      id
    }
  }
`

const addJobHandler = graphql(createJobGraphQL, {
  props: ({ mutate, ownProps }) => ({
    addJob: async (value) => {
      const mutationInput = {
        printerID: ownProps.printerID,
        name: value.map(f => f.name).join(', '),
        files: [],
      }

      // read each file into memory
      Promise.all(
        value.map(async (file) => {
          const { name } = file

          /* read the file */
          // eslint-disable-next-line no-undef
          const fileReader = new FileReader()
          fileReader.readAsText(file)

          await new Promise((resolve) => {
            fileReader.onload = resolve
          })

          mutationInput.files.push({
            name,
            content: fileReader.result,
          })
        }),
      )

      /* execute the mutation */
      mutate({
        variables: {
          input: mutationInput,
        },
      })
    },
  }),
})


export default addJobHandler
