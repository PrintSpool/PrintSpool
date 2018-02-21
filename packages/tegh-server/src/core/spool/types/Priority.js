export type Priority = 'emergency' | 'preemptive' | 'normal'

export const priorityOrder = List([
  'emergency',
  'preemptive',
  'normal',
])
