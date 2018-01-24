export const getReady = state =>
  state.driver.ready

export const getCurrentLine = state =>
  state.spool.currentLine

export const getCurrentSerialLineNumber = state =>
  state.driver.currentLineNumber

export const getSerialTimeout = state =>
  state.config.driver.serialTimeout

export const getLongRunningCodes = state =>
  state.config.driver.longRunningCodes

export const getPollingInterval = state =>
  state.config.driver.temperaturePollingInterval

export const getCurrentTask = state =>
  state.spool.allTasks.get(spool.currentTaskID)

export const shouldSendSpooledLineToPrinter = state =>
  state.spool.sendSpooledLineToPrinter
