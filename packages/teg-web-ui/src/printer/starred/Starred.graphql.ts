import { gql } from '@apollo/client'

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
    createdAt
  }
`

export const PRINT_QUEUES_QUERY = gql`
  fragment QueryFragment on Query {
    machines(input: { machineID: $machineID }) {
      id
      status
    }
    printQueues(input: { machineID: $machineID }) {
      id
      name
      parts(input: { includeQueued: false, includeStarred: true }) {
        ...PrintQueuePartFragment
      }
    }
  }
  ${PRINT_QUEUE_PART_FRAGMENT}
`

export const DELETE_PART = gql`
  mutation deleteParts($input: DeletePartsInput!) {
    deleteParts(input: $input) {
      partIDs
    }
  }
`

export const ADD_STARRED_PACKAGES_TO_PRINT_QUEUE = gql`
  mutation addStarredPackagesToPrintQueue($input: AddStarredPackagesToPrintQueueInput!) {
    addStarredPackagesToPrintQueue(input: $input) {
      id
      printQueueID
      parts {
        ...PrintQueuePartFragment
      }
    }
  }
  ${PRINT_QUEUE_PART_FRAGMENT}
`
