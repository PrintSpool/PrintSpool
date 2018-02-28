import { List } from 'immutable'

export type PriorityEnumT =
  | 'emergency'
  | 'preemptive'
  | 'normal'

export const priorityOrder = List([
  'emergency',
  'preemptive',
  'normal',
])
