import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client'
import { useSnackbar } from 'notistack'

export const LATEST_PRINT_FRAGMENT = gql`
  fragment LatestPrintFragment on Print {
    id
    part {
      id
      name
    }
    task {
      id
      percentComplete(digits: 1)
      eta
      startedAt
      stoppedAt
      status
      paused
      settled
      partID
      machine {
        id
        name
        status
        components {
          id
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
`

export const PRINT_QUEUE_PART_FRAGMENT = gql`
  fragment PrintQueuePartFragment on Part {
    id
    packageID
    name
    quantity
    position
    printsInProgress
    printsCompleted
    totalPrints
    startedFinalPrint
    starred
  }
`

export const PRINT_QUEUES_QUERY = gql`
  fragment QueryFragment on Query {
    machines(input: { machineID: $machineID }) {
      id
      name
      status
    }
    latestPrints(input: { machineIDs: [$machineID] }) {
      ...LatestPrintFragment
    }
    printQueues(input: { machineID: $machineID }) {
      id
      name
      parts {
        ...PrintQueuePartFragment
      }
    }
  }
  ${LATEST_PRINT_FRAGMENT}
  ${PRINT_QUEUE_PART_FRAGMENT}
`

export const STOP = gql`
  mutation stop($machineID: ID!) {
    stop(machineID: $machineID) {
      id
      status
    }
  }
`

export const SET_PART_POSITIONS = gql`
  mutation setPartPositions($input: SetPartPositionsInput!) {
    setPartPositions(input: $input) {
      id
      position
    }
  }
`

export const PRINT_FRAGMENT = gql`
  fragment PrintFragment on Print {
    ...LatestPrintFragment
    part {
      ...PrintQueuePartFragment
    }
  }
  ${LATEST_PRINT_FRAGMENT}
  ${PRINT_QUEUE_PART_FRAGMENT}
`

export const PRINT = gql`
  mutation print($input: PrintInput!) {
    print(input: $input) {
      ...PrintFragment
      task {
        machine {
          id
          status
        }
      }
    }
  }
  ${PRINT_FRAGMENT}
`

export const DELETE_PART = gql`
  mutation deleteParts($input: DeletePartsInput!) {
    deleteParts(input: $input) {
      partIDs
    }
  }
`

export const usePrintMutation = () => {
  const { enqueueSnackbar } = useSnackbar()

  const SuccessMutationOpts = (msg) => ({
    onCompleted: () => {
      enqueueSnackbar(msg, {
        variant: 'success',
      })
    }
  })

  return useMutation(
    PRINT,
    {
      ...SuccessMutationOpts('Print started!'),
      // Add the print to the latest prints cache so the UI updates immediately instead of waiting
      // on the next query polling
      update: (cache, { data: { print: newPrint } }) => {
        cache.modify({
          fields: {
            latestPrints: (previousPrints = [], { readField }) => {
              const newPrintRef = cache.writeFragment({
                data: newPrint,
                fragment: LATEST_PRINT_FRAGMENT,
              })

              // There can only be one active print per machine so remove the previous print.
              const nextPrints = previousPrints.filter((printRef) => {
                let taskRef: any = readField('task', printRef)
                let machineRef: any = readField('machine', taskRef)
                let taskMachineID: any = readField('id', machineRef)

                return taskMachineID !== newPrint.task.machine.id
              })

              // console.log({ newPrintRef, previousPrints }, [...nextPrints, newPrintRef])

              return [...nextPrints, newPrintRef]
            }
          }
        })
      }
    },
  )
}
