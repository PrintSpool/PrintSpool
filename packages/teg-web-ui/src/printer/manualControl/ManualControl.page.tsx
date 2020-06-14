import React from 'react'
import gql from 'graphql-tag'
import useReactRouter from 'use-react-router'

import PrinterStatusGraphQL from '../common/PrinterStatus.graphql'

import { ComponentControlFragment } from './printerComponents/ComponentControl'

import ManualControlView from './ManualControl.view'
import useLiveSubscription from '../_hooks/useLiveSubscription'

const MANUAL_CONTROL_SUBSCRIPTION = gql`
  subscription ManualControlSubscription($machineID: ID!) {
    live {
      patch { op, path, from, value }
      query {
        singularMachine: machines(machineID: $machineID) {
          ...PrinterStatus
          motorsEnabled
          components {
            ...ComponentControlFragment
          }
        }
      }
    }
  }

  # fragments
  ${PrinterStatusGraphQL}
  ${ComponentControlFragment}
`

const ManualControlPage = () => {
  const { match: { params } } = useReactRouter()

  const { loading, error, data } = useLiveSubscription(MANUAL_CONTROL_SUBSCRIPTION, {
    variables: {
      machineID: params.machineID,
    },
  })

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
  }

  const machine = (data as any).singularMachine[0]
  const isReady = machine?.status === 'READY'

  return (
    <ManualControlView
      {...{
        machine,
        isReady,
      }}
    />
  )
}

export default ManualControlPage
