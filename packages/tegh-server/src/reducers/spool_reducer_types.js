import type { RecordOf, List, Set } from 'immutable'

export type SpoolAction = {
  +type: 'SPOOL',
  +priority: Priority,
  +internal: boolean,
  +data: Array<string>,
  fileName: ?string,
}

export type DespoolAction = {
  +type: 'DESPOOL',
}

export type SpoolState = RecordOf<{
  queuedTaskIDs: List<String>,
  allTasks: Set<Task>,
  currentTaskID: ?String,
  sendSpooledLineToPrinter: boolean,
}>
