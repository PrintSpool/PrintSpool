export const DATA_SENT_AND_RECEIVED = 'teg-core/jobQueue/DATA_SENT_AND_RECEIVED'

const dataSentAndReceived = (task, responses) => ({
  type: DATA_SENT_AND_RECEIVED,
  payload: { task, responses },
})

export default lineNumberChange
