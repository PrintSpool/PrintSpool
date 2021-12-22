import React from 'react'
import { gql, useMutation } from '@apollo/client'
import { useHistory, useParams } from 'react-router'

import useLiveSubscription from '../../_hooks/useLiveSubscription'
import { CONFIG_FORM_FRAGMENT } from '../../config/components/ConfigForm/ConfigForm'
import EditPartView from './EditPart.view'
import { useSnackbar } from 'notistack'

const PART_QUERY = gql`
  fragment QueryFragment on Query {
    machines(input: { machineID: $machineID }) {
      id
      name
    }
    parts(input: { partID: $partID }) {
      id
      name
      startedFinalPrint
      quantity
    }
  }
`

const SET_PART_QUANTITY = gql`
  mutation setPartQuantity($input: SetPartQuantityInput!) {
    setPartQuantity(input: $input) {
      id
      quantity
    }
  }
`

const SET_PART_POSITIONS = gql`
  mutation setPartPositions($input: SetPartPositionsInput!) {
    setPartPositions(input: $input) { id }
  }
`

const EditPartPage = () => {
  const { machineID, partID } = useParams()
  const history = useHistory()
  const { enqueueSnackbar } = useSnackbar()

  const { loading, error, data } = useLiveSubscription(PART_QUERY, {
    variablesDef: '($machineID: ID, $partID: ID)',
    variables: {
      machineID,
      partID,
    },
  })

  const part = data?.parts[0]

  const [setQuantityInner, setQuantityMutation] = useMutation(SET_PART_QUANTITY)

  const onSave = () => {
    enqueueSnackbar('Part saved!', {
      variant: 'success',
    })
  }

  const setQuantity = async ({ quantity }) => {
    await setQuantityInner({
      variables: {
        input: {
          partID,
          quantity: parseInt(quantity, 10),
        }
      }
    })
    onSave()
  }

  const [setPositions] = useMutation(SET_PART_POSITIONS)

  const moveToTopOfQueue = async () => {
    try {
      await setPositions({
        variables: {
          input: {
            parts: [{
              partID,
              position: 0,
            }],
          },
        },
      })
      onSave()
    } catch(e) {
      enqueueSnackbar(`Error: ${e.message}`, {
        variant: 'error',
      })
    }
  }


  if (loading) {
    return <div />
  }

  if (error != null) {
    throw error
  }

  return (
    <EditPartView {...{
        machineName: data.machines[0].name,
        part,
        setQuantity,
        setQuantityMutation,
        moveToTopOfQueue,
        history,
    }} />
  )
}

export default EditPartPage
