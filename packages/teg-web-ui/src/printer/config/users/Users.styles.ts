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
  updateTitleAvatar: {
    float: 'left',
    marginTop: '0.2em',
    marginRight: theme.spacing(1),
  },
}))

export default useStyles
