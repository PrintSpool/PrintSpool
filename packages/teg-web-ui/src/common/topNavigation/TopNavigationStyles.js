import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: 'min-content max-content 1fr auto',
    gridTemplateRows: 'auto',
    alignItems: 'center',
    // background: 'linear-gradient(#DD25C4, #9602A7)',
    background: '#DD25C4',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  withMenu: {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
    },
  },
  logo: {
    height: 50,
    marginRight: theme.spacing(2),
  },
  title: {
    color: 'white',
  },
  actions: {
    justifySelf: 'end',
    display: 'flex',
  },
  buttonClass: {
    color: 'white',
  },
}), { withTheme: true })

export default useStyles
