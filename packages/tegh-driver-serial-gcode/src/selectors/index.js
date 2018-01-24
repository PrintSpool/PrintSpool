export const isReady = state =>
  state.driver.ready

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
  task.data.get(task.currentLineNumber)
}

export const shouldSendSpooledLineToPrinter = state =>
  state.spool.sendSpooledLineToPrinter
