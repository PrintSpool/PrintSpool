import { makeStyles } from '@material-ui/styles'

// eslint-disable-next-line
const useStyles = makeStyles(theme => ({
  root: {
    overflow: 'scroll',
  },
  emptyQueueContainer: {
    position: 'relative',
    top: '12vh',
    height: '50vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyQueueText: {
    color: 'rgba(0, 0, 0, 0.54)',
  },
  jobContainer: {
    marginBottom: theme.spacing(3),
  },
}), { withTheme: true })

export default useStyles
