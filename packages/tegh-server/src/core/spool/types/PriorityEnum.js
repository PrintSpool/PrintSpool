export type PriorityEnumT =
  | 'emergency'
  | 'preemptive'
  | 'normal'

export const priorityOrder = List([
  'emergency',
  'preemptive',
  'normal',
])
