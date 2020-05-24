import { makeStyles } from '@material-ui/styles'

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
  videoStreamer: {
    // alignSelf: 'center',
    marginBottom: theme.spacing(2),
    display: 'grid',
    alignContent: 'center',
    overflow: 'hidden',

    // Vertical Split
    maxHeight: '35vh',
    // // Horizontal Split
    // [theme.breakpoints.up('md')]: {
    //   maxHeight: '100vh',
    //   width: '25vw',
    //   height: '100%',
    // },
  },
  controls: {
    overflow: 'scroll',
    scrollbarWidth: 'none',
    // // Horizontal Split
    // [theme.breakpoints.up('md')]: {
    //   paddingRight: theme.spacing(2),
    // },
  },
}), { withTheme: true })

export default useStyles
