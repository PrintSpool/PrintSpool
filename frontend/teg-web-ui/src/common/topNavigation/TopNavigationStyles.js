import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
  mainMenu: {
    display: 'grid',
    gridTemplateColumns: 'max-content 1fr auto',
    gridTemplateRows: 'auto',
    alignItems: 'center',
    // background: 'linear-gradient(#DD25C4, #9602A7)',
    background: '#DD25C4',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  withMenu: {
    [theme.breakpoints.down('md')]: {
      paddingLeft: 0,
    },
  },
  logo: {
    height: 50,
    marginRight: theme.spacing(2),
  },
  title: {
    color: 'white',
    textDecoration: 'none',
  },
  userProfileMenu: {
    justifySelf: 'flex-end',
    display: 'flex',
  },
  buttonClass: {
    color: 'white',
  },
}))

export default useStyles
