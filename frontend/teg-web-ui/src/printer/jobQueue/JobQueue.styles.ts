import { lighten, makeStyles } from '@material-ui/core/styles'

// eslint-disable-next-line
const useStyles = makeStyles(theme => ({
  root: {
    // overflow: 'scroll',
    display: 'grid',
    gridTemplateRows: 'auto auto auto 1fr',
    padding: theme.spacing(2),
    overflowX: 'hidden',
  },
  headerCheckbox: {
    paddingTop: 3,
    paddingBottom: 3,
  },
  latestPrints: {
    paddingBottom: theme.spacing(2),
  },
  partsList: {
    // paddingBottom: theme.spacing(2),
  },
  savedCell: {
    paddingLeft: 0,
    width: 36,
  },
  savedStar: {
    // float: 'left',
    // marginTop: 5,
    color: theme.palette.warning.light
  },
  UnsavedStarOutline: {
    // float: 'left',
    // marginTop: 5,
    color: theme.palette.text.hint,
  },
  qty: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    color: theme.palette.text.hint,
  },
  dragging: {
    background: '#EEE',
  },
  draggingOrEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px dashed #666',
  },
  dragArea: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  dragLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
  },
  dragText: {
    cursor: 'pointer',
    color: '#444',
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem',
    },
  },
 dragIcon: {
    color: '#444',
    width: theme.spacing(9),
    height: theme.spacing(9),
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
  // Add and Print Next buttons
  actionsRowButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  // addJobFab: {
  //   position: 'fixed',
  //   bottom: theme.spacing(3) + 56,
  //   right: theme.spacing(2),
  // },
  // fabIconExtended: {
  //   marginRight: theme.spacing(1),
  // },
}))

export default useStyles
