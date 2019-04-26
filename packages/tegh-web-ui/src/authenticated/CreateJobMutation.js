import React from 'react'
import Promise from 'bluebird'

import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

const createJobGraphQL = gql`
  mutation createJob($input: CreateJobInput!) {
    createJob(input: $input)
  }
`

const createJobHOF = (mutation, files) => async () => {
  const mutationInput = {
    name: files.map(f => f.name).join(', '),
    files: [],
  }

  // read each file into memory
  await Promise.all(
    files.map(async (file) => {
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
  mutation({
    variables: {
      input: mutationInput,
    },
  })
}

const CreateJobMutation = ({
  files,
  children,
  ...props
}) => (
  <Mutation
    mutation={createJobGraphQL}
    {...props}
  >
    {(mutation, { data }) => (
      children({
        createJob: createJobHOF(mutation, files),
        data,
      })
    )}
  </Mutation>
)


export default CreateJobMutation
