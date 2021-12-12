import React from 'react'
import { useParams, useHistory } from 'react-router'
import { gql, useMutation } from '@apollo/client'

import useDeleteConfig from '../components/useDeleteConfig'
import useLiveSubscription from '../../_hooks/useLiveSubscription'
import MaterialsConfigView from './Materials.view'
import { UPDATE_DIALOG_FRAGMENT } from '../components/UpdateDialog/UpdateDialog.page'

const CONFIG_QUERY = gql`
  fragment QueryFragment on Query {
    # hasPendingUpdates
    materials {
      id
      name
      shortSummary
      configForm {
        ...ConfigFormFragment
      }
    }
  }
  ${UPDATE_DIALOG_FRAGMENT}
`

const UPDATE_MATERIAL = gql`
  mutation updateMaterial($input: UpdateMaterialInput!) {
    updateMaterial(input: $input) {
      id
      name
      shortSummary
      configForm {
        ...ConfigFormFragment
      }
    }
  }
  ${UPDATE_DIALOG_FRAGMENT}
`

const DELETE_MATERIAL = gql`
  mutation deleteMaterial($input: DeleteMaterialInput!) {
    deleteMaterial(input: $input) {
      id
    }
  }
`

const MaterialsConfigIndex = () => {
  const history = useHistory()
  const { materialID, ...params } = useParams()
  const verb = materialID === 'new' ? 'new' : params.verb

  const { data, error, loading } = useLiveSubscription(CONFIG_QUERY)
  const { materials } = data || {}
  const material = materialID && materials?.find(m => m.id === materialID)

  const [updateMaterial, updateMaterialMutation] = useMutation(UPDATE_MATERIAL, {
    update: (mutationResult: any) => {
      if (mutationResult.data != null) {
        history.push('../')
      }
    },
  })

  const update = (model) => {
    updateMaterial({
      variables: {
        input: {
          materialID,
          modelVersion: material.configForm.modelVersion,
          model,
        }
      }
    })
  }

  useDeleteConfig(DELETE_MATERIAL, {
    variables: {
      input: {
        materialID,
      },
    },
    show: materialID != null && verb === 'delete',
    type: 'material',
    title: material?.name,
  })

  if (loading) {
    return <div/>
  }

  if (error) {
    throw error
  }

  return (
    <MaterialsConfigView {...{
      materialID,
      verb,
      materials,
      hasPendingUpdates: false,
      update,
      updateMutation: updateMaterialMutation,
    }} />
  )
}

export default MaterialsConfigIndex
