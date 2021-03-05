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

const SET_JOB_POSITION = gql`
  mutation setPartPosition($input: SetPartPositionInput!) {
    setPartPosition(input: $input) { id }
  }
`

const JobPage = () => {
  const { match: { params } } = useReactRouter()
  const { partID } = params

  const { loading, error, data } = useLiveSubscription(JOB_QUERY, {
    variablesDef: '($partID: ID)',
    variables: {
      partID,
    },
  })

  const [cancelTask] = useMutation(STOP)
  const [pausePrint] = useMutation(gql`
    mutation pausePrint($taskID: ID!) {
      pausePrint(taskID: $taskID) { id }
    }
  `)
  const [resumePrint] = useMutation(gql`
    mutation resumePrint($taskID: ID!) {
      resumePrint(taskID: $taskID) { id }
    }
  `)
  const [setPartPosition] = useMutation(SET_JOB_POSITION)

  const moveToTopOfQueue = () => setPartPosition({
    variables: {
      input: {
        partID,
        position: 0,
      },
    },
  })

  const part = (data as any)?.parts[0]
  const task = part?.tasks.find(t =>
    !['ERRORED', 'CANCELLED', 'FINISHED'].includes(t.status)
  )
  const machine = task?.machine
  console.log(machine)

  viewMachine({ machine })

  const execGCodes = useExecGCodes(args => ({ machine, ...args }), [machine])
  const isReady = machine?.status === 'READY'
  const isPrinting = machine?.status === 'PRINTING'

  if (error) {
    throw error
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
        moveToTopOfQueue,
        execGCodes,
        isReady,
        isPrinting,
      }}
    />
  )
}

export default JobPage
