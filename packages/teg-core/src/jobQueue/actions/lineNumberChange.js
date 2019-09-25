export const LINE_NUMBER_CHANGE = 'teg-core/jobQueue/LINE_NUMBER_CHANGE'

const lineNumberChange = task => ({
  type: LINE_NUMBER_CHANGE,
  payload: { task },
})

export default lineNumberChange
