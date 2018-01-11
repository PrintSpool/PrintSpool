import type { RecordOf, List, Set } from 'immutable'

export type SpoolName = 'manualSpool' | 'internalSpool' | 'printQueue'

export type SpoolAction = {
  +type: 'SPOOL',
  +spoolName: SpoolName,
  +data: Array<string>,
  fileName: ?string,
}

export type DespoolAction = {
  +type: 'DESPOOL',
}

export type Task = RecordOf<{
  id: string,
  spoolName: SpoolName,
  data: List<string>,
  fileName: ?string,
  currentLineNumber: ?number,
  createdAt: ?number,
  startedAt: ?number,
  stoppedAt: ?number,
  status: 'queued' | 'printing' | 'errored' | 'done',
}>

export type SpoolState = RecordOf<{
  manualSpool: List<String>,
  internalSpool: List<String>,
  printQueue: List<String>,
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
