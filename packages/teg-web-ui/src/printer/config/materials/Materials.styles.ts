import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    overflowY: 'scroll',
  },
  title: {
    paddingTop: theme.spacing(3),
  },
  addFab: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(2),
  },
}))

export default useStyles
