import Promise from 'bluebird'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'

const createJobGraphQL = gql`
  mutation createJob($input: CreateJobInput!) {
    createJob(input: $input)
  }
`

const addJobHandler = graphql(createJobGraphQL, {
  props: ({ mutate }) => ({
    addJob: async (value) => {
      const mutationInput = {
        name: value.map(f => f.name).join(', '),
        files: [],
      }

      // read each file into memory
      await Promise.all(
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
