import { List } from 'immutable'

export const EMERGENCY = 'EMERGENCY'
export const PREEMPTIVE = 'PREEMPTIVE'
export const NORMAL = 'NORMAL'

export type PriorityEnumT =
  | 'EMERGENCY'
  | 'PREEMPTIVE'
  | 'NORMAL'

export const priorityOrder = List([
  EMERGENCY,
  PREEMPTIVE,
  NORMAL,
])
