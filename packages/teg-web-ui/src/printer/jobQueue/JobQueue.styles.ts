import { makeStyles } from '@material-ui/core/styles'

// eslint-disable-next-line
const useStyles = makeStyles(theme => ({
  root: {
    overflow: 'scroll',
  },
  dragging: {
    border: '4px dashed #666',
  },
  draggingOrEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  dragText: {
    color: '#444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    fontSize: '1.5rem',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem',
    },
  },
  chooseAFileButton: {
    fontSize: '1.5rem',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem',
    },
  },
  dragIcon: {
    fontSize: '3rem',
    marginRight: '0.5rem',
    color: '#444',
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
  addJobFab: {
    position: 'fixed',
    bottom: theme.spacing(4) + 56,
    right: theme.spacing(2),
  },
}))

export default useStyles
