import usr2Received from '../actions/usr2Received'

const watchUpdatesFile = (dispatch) => {
  process.on('SIGUSR2', () => {
    const action = usr2Received()

    dispatch(action)
  })
}

export default watchUpdatesFile
