import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    // Vertical Split
    gridTemplateRows: 'auto 1fr',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    // // Horizontal Split
    // [theme.breakpoints.up('md')]: {
    //   gridTemplateColumns: 'auto 1fr',
    //   paddingLeft: 0,
    //   paddingRight: 0,
    // },
    overflow: 'hidden',
  },
  // videoStreamer: {
  //   // // alignSelf: 'center',
  //   // marginBottom: theme.spacing(2),
  //   // // display: 'grid',
  //   // alignContent: 'center',
  //   // // overflow: 'hidden',

  //   // // Vertical Split
  //   // maxHeight: '35vh',
  //   // // // Horizontal Split
  //   // // [theme.breakpoints.up('md')]: {
  //   // //   maxHeight: '100vh',
  //   // //   width: '25vw',
  //   // //   height: '100%',
  //   // // },
  //   overflow: 'visible',
  // },
  controls: {
    overflow: 'scroll',
    scrollbarWidth: 'none',
    // // Horizontal Split
    // [theme.breakpoints.up('md')]: {
    //   paddingRight: theme.spacing(2),
    // },
  },
  generalControls: {
    display: 'flex',
    justifyContent: 'space-between',

    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },
  generalAndJogDivider: {
    marginBottom: theme.spacing(2),
  },
  jogButtons: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row',
    },
  },
  jogDivider: {
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.up('md')]: {
      marginLeft: theme.spacing(4),
      marginRight: theme.spacing(4),
    },
  },
  fansAndHeatersContainer: {
    // margin: 0,
    // width: '100%',
  },
}))

export default useStyles
