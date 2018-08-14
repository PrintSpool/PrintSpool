import { PriorityEnum } from 'tegh-server'
const { EMERGENCY } = PriorityEnum

export const isReady = state =>
  state.driver.status === 'ready'

export const isEStopped = state =>
  state.driver.status === 'estopped'

export const getCurrentSerialLineNumber = state =>
  state.driver.currentLineNumber

// CONFIG

export const getSerialTimeout = state =>
  state.config.driver.serialTimeout

export const getLongRunningCodes = state =>
  state.config.driver.longRunningCodes

export const getPollingInterval = state =>
  state.config.driver.temperaturePollingInterval

// SPOOL

export const getCurrentTask = state =>
  state.spool.tasks.get(state.spool.currentTaskID)

export const getCurrentLine = state => {
  const task = getCurrentTask(state)
  if (task == null) return null
  return task.data.get(task.currentLineNumber)
}

export const getCurrentFileLineNumber = state =>
  getCurrentTask(state).currentLineNumber

export const getCurrentFileName = state =>
  getCurrentTask(state).name

export const isEmergency = state =>
  getCurrentTask(state).priority === EMERGENCY

export const shouldSendSpooledLineToPrinter = state =>
  state.spool.sendSpooledLineToPrinter
