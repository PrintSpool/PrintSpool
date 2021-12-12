import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    placeItems: 'center',
    zIndex: '10',
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '95vh',
    paddingBottom: '5vh',
    background: 'white',
    zIndex: 1000,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: 'max-content auto',
  },
  text: {
    paddingLeft: 16,
  },
}))

export default useStyles
