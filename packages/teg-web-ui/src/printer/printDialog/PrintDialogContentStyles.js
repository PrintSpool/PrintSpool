import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  webGLContainer: {
    minWidth: '80vw',
    height: '60vh',
    marginLeft: -24,
    marginRight: -24,
    zIndex: 10,
  },
  loading: {
    position: 'absolute',
    left: '0',
    top: '40vh',
    textAlign: 'center',
    width: '100%',
    color: '#999',
  },
  largeFileMessage: {
    position: 'absolute',
    left: '0',
    top: '40vh',
    textAlign: 'center',
    width: '100%',
  },
  enableButton: {
    marginLeft: '2rem',
  },
}))

export default useStyles
