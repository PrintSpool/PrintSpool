import { useEffect } from 'react'
import { gql } from '@apollo/client'

import { useMutation } from '@apollo/client'
import useRouter from 'use-react-router'

import useConfirm from '../../../common/_hooks/useConfirm'

const deleteConfigMutation = gql`
  mutation deleteConfig($input: DeleteConfigInput!) {
    deleteConfig(input: $input)
  }
`

export const useDelete = ({
  fn,
  onCancel,
  show,
  type,
  title,
  fullTitle = false,
}) => {
  const confirm = useConfirm()

  const confirmedDeleteConfig = confirm(() => {
    return {
      fn,
      onCancel,
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

export const useDeleteConfig = (mutation, {
  variables,
  show,
  type,
  title,
  fullTitle = false,
}) => {
  const { history } = useRouter()
  const [deleteConfig] = useMutation(mutation)

  useDelete({
    show,
    type,
    title,
    fullTitle,
    fn: async () => {
      await deleteConfig({ variables })

      history.push('../')
    },
    onCancel: () => {
      history.push('../')
    },
  })
}

export default useDeleteConfig
