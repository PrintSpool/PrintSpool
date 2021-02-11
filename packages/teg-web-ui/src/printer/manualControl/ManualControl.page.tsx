import React from 'react'
import { gql } from '@apollo/client'
import useReactRouter from 'use-react-router'

import PrinterStatusGraphQL from '../common/PrinterStatus.graphql'

import { ComponentControlFragment } from './printerComponents/ComponentControl'

import ManualControlView from './ManualControl.view'
import useLiveSubscription from '../_hooks/useLiveSubscription'
import useExecGCodes from '../_hooks/useExecGCodes'
import viewMachine from '../_hooks/viewMachine'

const MANUAL_CONTROL_QUERY = gql`
  fragment QueryFragment on Query {
    singularMachine: machines(input: { machineID: $machineID }) {
      ...PrinterStatus
      swapXAndYOrientation
      motorsEnabled
      components {
        ...ComponentControlFragment
      }
    }
  }

  # fragments
  ${PrinterStatusGraphQL}
  ${ComponentControlFragment}
`

const ManualControlPage = () => {
  const { match: { params } } = useReactRouter()

  const { loading, error, data } = useLiveSubscription(MANUAL_CONTROL_QUERY, {
    variablesDef: '($machineID: ID)',
    variables: {
      machineID: params.machineID,
    },
  })

  const machine = (data as any)?.singularMachine[0]
  const isReady = machine?.status === 'READY'
  const isPrinting = machine?.status === 'PRINTING'

  viewMachine({ machine })
  const execGCodes = useExecGCodes(args => ({ machine, ...args }), [machine])
  // const execGCodes = useCallback(async (args) => {
  //   execGCodesAsync.run(args)
  //   await execGCodesAsync.promise
  // }, [machine])

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
  }

  return (
    <ManualControlView
      {...{
        machine,
        isReady,
        isPrinting,
        execGCodes,
      }}
    />
  )
}

export default ManualControlPage
