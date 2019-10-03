import { Record, List, Map } from 'immutable'

import { SET_CONFIG } from '../../config/actions/setConfig'
import { DATA_SENT_AND_RECEIVED } from '../../jobQueue/actions/dataSentAndReceived'

export const TX = 'TX'
export const RX = 'RX'

const MachineHistory = Record({
  historyEntries: List(),
  maxSize: 400,
  lastResponseID: 0,
})

export const initialState = Map()

let nextID = 0

const HistoryEntry = (entry) => {
  // eslint-disable-next-line no-param-reassign
  entry.id = nextID
  nextID += 1
  return entry
}

const addCommands = (
  task,
  previousLineNumber,
  lineNumber,
  createdAt,
  newEntries,
) => {
  const addedCommands = task.commands.slice(
    previousLineNumber + 1,
    lineNumber + 1,
  )

  addedCommands.forEach(command => (
    newEntries.push(
      HistoryEntry({
        content: command,
        createdAt,
        direction: TX,
      }),
    )
  ))
}


const gcodeHistoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_CONFIG: {
      const { config } = action.payload

      return config.machines.map(() => MachineHistory())
    }
    case DATA_SENT_AND_RECEIVED: {
      const {
        machineID,
        task,
        responses = [],
      } = action.payload
      const { maxSize } = state.get(machineID)

      let { previousLineNumber = -1 } = task

      const createdAt = new Date().toISOString()

      const newEntries = []
      responses.forEach((res) => {
        const {
          taskId,
          lineNumber,
          content,
        } = res

        // TX Entries preceeding an RX response
        if (taskId === task.id && lineNumber > previousLineNumber) {
          addCommands(
            task,
            previousLineNumber,
            lineNumber,
            createdAt,
            newEntries,
          )
          previousLineNumber = lineNumber
        }

        // RX Entries
        newEntries.push(
          HistoryEntry({
            content,
            createdAt,
            direction: RX,
          }),
        )
      })

      // TX Entries after the last RX entry
      addCommands(
        task,
        previousLineNumber,
        task.currentLineNumber,
        createdAt,
        newEntries,
      )

      return state
        .updateIn([machineID, 'historyEntries'], (entries) => {
          let nextEntries = entries.concat(newEntries)

          if (nextEntries.size > maxSize) {
            nextEntries = nextEntries.slice(-maxSize)
          }

          return nextEntries
        })
    }
    default: {
      return state
    }
  }
}

export default gcodeHistoryReducer
