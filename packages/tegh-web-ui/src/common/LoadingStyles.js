import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    placeItems: 'center',
    zIndex: '10',
  },
  text: {
    paddingLeft: 16,
  },
}))

export default useStyles
