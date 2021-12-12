import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router'

import { gql } from '@apollo/client'

import { useExecGCodes2 } from '../_hooks/useExecGCodes'
import useLiveSubscription from '../_hooks/useLiveSubscription'

import TerminalView from './Terminal.view'

const GCODE_HISTORY_QUERY = gql`
  fragment QueryFragment on Query {
    machines(input: { machineID: $machineID }) {
      id
      status
      gcodeHistory(limit: 200) {
        id
        direction
        createdAt
        content
      }
    }
  }
`

const Terminal = () => {
  const { machineID } = useParams()

  const {
    handleSubmit,
    register,
    errors,
    setError,
    reset,
    getValues
  } = useForm({
    defaultValues: {
      gcode: '',
    },
  })


  const execGCode = useExecGCodes2(() => {
    console.log(getValues().gcode, JSON.stringify(getValues()))
    return {
      machineID,
      gcodes: [getValues().gcode],
    }
  }, [], { snackbarOnError: false })

  const onSubmit = () => {
    execGCode.run()
  }

  useEffect(() => {
    // console.log(execGCode)
    if (execGCode.error) {
      setError('gcode', {
        type: 'serverError',
        message: execGCode.error.message,
      })
    }
    if (execGCode.isFulfilled) {
      reset()
    }
  }, [execGCode.isLoading])

  const {
    data,
    loading,
    error,
  } = useLiveSubscription(GCODE_HISTORY_QUERY, {
    variablesDef: '($machineID: ID)',
    variables: {
      machineID,
    },
  })

  if (loading) {
    return <div />
  }

  if (error) {
    throw error
  }

  const { status, gcodeHistory } = data.machines[0]
  const isReady = ['READY'].includes(status)
  // const isReady = ['READY', 'PRINTING'].includes(status)

  return (
    <TerminalView {...{
      onSubmit: handleSubmit(onSubmit),
      isSubmitting: execGCode.isLoading,
      errors,
      register,
      isReady,
      gcodeHistory,
    }} />
  )
}

export default Terminal
