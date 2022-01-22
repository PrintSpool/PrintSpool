import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(() => ({
  webGLLoadingOverlay: {
    minWidth: '80vw',
    height: '60vh',
    marginLeft: -24,
    marginRight: -24,
  },
  webGLContainer: {
    minWidth: '80vw',
    height: '60vh',
    zIndex: 10,
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
