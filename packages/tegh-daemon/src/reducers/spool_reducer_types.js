import type { RecordOf, List, Set } from 'immutable'

export type Priority = 'emergency' | 'preemptive' | 'normal'

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

export type Task = RecordOf<{
  id: string,
  priority: Priority,
  internal: boolean,
  data: List<string>,
  fileName: ?string,
  currentLineNumber: ?number,
  createdAt: ?number,
  startedAt: ?number,
  stoppedAt: ?number,
  status: 'queued' | 'printing' | 'errored' | 'cancelled' | 'done',
}>

export type SpoolState = RecordOf<{
  queuedTaskIDs: List<String>,
  allTasks: Set<Task>,
  currentTaskID: ?String,
  sendSpooledLineToPrinter: boolean,
}>

// export type Task = {
//   +id: string,
//   +spoolID: SpoolName,
//   +data: Array<string>,
//   +fileName: ?string,
//   +currentLineNumber: number,
// }

// export type SpoolState = {
//   +manualSpool: Array<Task>,
//   +internalSpool: Array<Task>,
//   +printQueue: Array<Task>,
//   +currentLine: ?string,
//   +sendSpooledLineToPrinter: boolean,
// }
