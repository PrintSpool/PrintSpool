import React from 'react'
import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'
import useReactRouter from 'use-react-router'

import useLiveSubscription from '../_hooks/useLiveSubscription'
import { ComponentControlFragment } from '../manualControl/printerComponents/ComponentControl'
import JobView from './Job.view'
import useExecGCodes from '../_hooks/useExecGCodes'
import viewMachine from '../_hooks/viewMachine'
import PrinterStatusGraphQL from '../common/PrinterStatus.graphql'
import { useSnackbar } from 'notistack'

const JOB_QUERY = gql`
  fragment QueryFragment on Query {
    parts(input: { partID: $partID }) {
      id
      name
      quantity
      printsCompleted
      totalPrints
      # stoppedAt
      # history {
      #   id
      #   createdAt
      #   type
      # }

      tasks {
        id
        percentComplete(digits: 1)
        estimatedPrintTimeMillis
        estimatedFilamentMeters
        startedAt
        stoppedAt
        status
        paused
        settled
        machine {
          ...PrinterStatus
          components {
            ...ComponentControlFragment
          }
          id
          name
          viewers {
            id
            description
            picture
          }
          components {
            id
            type
            name
            heater {
              id
              blocking
              actualTemperature
              targetTemperature
            }
          }
        }
      }
    }
  }

  # fragments
  ${ComponentControlFragment}
  ${PrinterStatusGraphQL}
`

const STOP = gql`
  mutation stop($machineID: ID!) {
    stop(machineID: $machineID) { id }
  }
`

const JobPage = () => {
  const { enqueueSnackbar } = useSnackbar()
  const { match: { params } } = useReactRouter()
  const { partID } = params

  const { loading, error, data } = useLiveSubscription(JOB_QUERY, {
    variablesDef: '($partID: ID)',
    variables: {
      partID,
    },
  })

  const SuccessMutationOpts = (msg) => ({
    onCompleted: () => {
      enqueueSnackbar(msg, {
        variant: 'success',
      })
    }
  })

  const [cancelTask, cancelTaskMutation] = useMutation(
    STOP,
    SuccessMutationOpts('Print cancelled!'),
  )
  const [pausePrint, pausePrintMutation] = useMutation(
    gql`
      mutation pausePrint($taskID: ID!) {
        pausePrint(taskID: $taskID) { id }
      }
    `,
    SuccessMutationOpts('Print pausing...'),
  )
  const [resumePrint, resumeMutation] = useMutation(
    gql`
      mutation resumePrint($taskID: ID!) {
        resumePrint(taskID: $taskID) { id }
      }
    `,
    SuccessMutationOpts('Print resumed!'),
  )

  const part = (data as any)?.parts[0]
  const task = part?.tasks.find(t =>
    !['ERRORED', 'CANCELLED', 'FINISHED'].includes(t.status)
  )
  const machine = task?.machine
  console.log(machine)

  viewMachine({ machine })

  const execGCodes = useExecGCodes(args => ({ machine, ...args }), [machine])
  const { status } = machine || {}
  const isReady = ['READY', 'PAUSED'].includes(status)
  const isPrinting = machine?.status === 'PRINTING'

  const mutationError = (
    null
    || cancelTaskMutation.error
    || pausePrintMutation.error
    || resumeMutation.error
  )

  if (error) {
    throw error
  }

  if (mutationError) {
    throw mutationError
  }

  if (loading || !data) {
    return <div />
  }

  return (
    <JobView
      {...{
        part,
        cancelTask,
        pausePrint,
        resumePrint,
        execGCodes,
        isReady,
        isPrinting,
        machineStatus: status,
      }}
    />
  )
}

export default JobPage
