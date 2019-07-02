import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    placeItems: 'center',
    zIndex: '10',
  },
  fullScreen: {
    height: '100vh',
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
