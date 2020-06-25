import { makeStyles } from '@material-ui/core/styles'

const drawerWidth = 280

// eslint-disable-next-line
const useStyles = makeStyles(theme => ({
  // root: {
  //   height: '100%'
  //   width: '100%',
  //   height: 430,
  //   zIndex: 1,
  //   overflow: 'hidden',
  // },
  navIconHide: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  fullHeight: {
    height: '100%',
  },
  drawerRoot: {
    height: '100%',
  },
  drawerPaper: {
    width: 280,
    height: '100%',
    [theme.breakpoints.up('md')]: {
      width: drawerWidth,
      position: 'inherit',
      top: 'inherit',
    },
  },
  content: {
    backgroundColor: theme.palette.background.default,
    width: '100%',
    padding: theme.spacing(3),
    height: 'calc(100% - 56px)',
    marginTop: 56,
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100% - 64px)',
      marginTop: 64,
    },
  },
  activeLink: {
    backgroundColor: '#ccc',
  },
  drawerContents: {
    paddingBottom: 0,
  },
}))

export default useStyles
