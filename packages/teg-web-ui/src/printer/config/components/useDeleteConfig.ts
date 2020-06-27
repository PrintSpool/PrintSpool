import { useEffect } from 'react'
import gql from 'graphql-tag'

import { useMutation } from 'react-apollo-hooks'
import useRouter from 'use-react-router'

import useConfirm from '../../../common/_hooks/useConfirm'

const deleteConfigMutation = gql`
  mutation deleteConfig($input: DeleteConfigInput!) {
    deleteConfig(input: $input)
  }
`

export const useDelete = ({
  fn,
  show,
  type,
  title,
  fullTitle = false,
}) => {
  const confirm = useConfirm()

  const confirmedDeleteConfig = confirm(() => {
    return {
      fn,
      title: fullTitle ? title : `Delete ${title}?`,
      description: (
        `This ${type} will be perminently deleted.`
      ),
    }
  })

  useEffect(() => {
    if (show) confirmedDeleteConfig()
  }, [show])
}

export const useDeleteConfig = ({
  id,
  collection,
  machineID,
  show,
  type,
  title,
  fullTitle = false,
}) => {
  const { history } = useRouter()
  const [deleteConfig] = useMutation(deleteConfigMutation)

  useDelete({
    show,
    type,
    title,
    fullTitle,
    fn: async () => {
      const input = {
        configFormID: id,
        collection,
        machineID,
      }

      await deleteConfig({ variables: { input } })

      history.push('../')
    }
  })
}

export default useDeleteConfig
