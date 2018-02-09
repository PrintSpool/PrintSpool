export const isReady = state =>
  state.driver.status === 'ready'

export const isEStopped = state =>
  state.driver.status === 'estopped'

export const shouldIgnoreOK = state =>
  state.driver.ignoreOK !== false

export const getCurrentSerialLineNumber = state =>
  state.driver.currentLineNumber

export const getSerialTimeout = state =>
  state.config.driver.serialTimeout

export const getLongRunningCodes = state =>
  state.config.driver.longRunningCodes

export const getPollingInterval = state =>
  state.config.driver.temperaturePollingInterval

export const getCurrentTask = state =>
  state.spool.allTasks.get(state.spool.currentTaskID)

export const getCurrentLine = state => {
  const task = getCurrentTask(state)
  if (task == null) return null
  return task.data.get(task.currentLineNumber)
}

export const isEmergency = state =>
  getCurrentTask(state).priority === 'emergency'

export const shouldSendSpooledLineToPrinter = state =>
  state.spool.sendSpooledLineToPrinter
