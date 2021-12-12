import { lighten, makeStyles } from '@material-ui/core/styles'

// eslint-disable-next-line
const useStyles = makeStyles(theme => ({
  root: {
    // overflow: 'scroll',
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    padding: theme.spacing(2),
    overflowX: 'hidden',
  },
  headerCheckbox: {
    paddingTop: 3,
    paddingBottom: 3,
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
  noStars: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    marginBottom: '20vh',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  noStarsText: {
    cursor: 'pointer',
    color: '#444',
    textAlign: 'center',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem',
    },
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
